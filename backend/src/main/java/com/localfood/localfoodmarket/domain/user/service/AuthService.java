package com.localfood.localfoodmarket.domain.user.service;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.user.dto.AuthResponseDto;
import com.localfood.localfoodmarket.domain.user.dto.LoginRequestDto;
import com.localfood.localfoodmarket.domain.user.dto.OAuth2CompleteRequestDto;
import com.localfood.localfoodmarket.domain.user.dto.RegisterRequestDto;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.SocialAccount;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.SocialAccountRepository;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import com.localfood.localfoodmarket.global.exception.BusinessException;
import com.localfood.localfoodmarket.global.exception.ErrorCode;
import com.localfood.localfoodmarket.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final FarmRepository farmRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        if (request.getRole() == Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "해당 역할로는 가입할 수 없어요.");
        }

        if (request.getRole() == Role.FARMER) {
            validateFarmFields(request);
        }

        validatePasswordStrength(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);

        if (request.getRole() == Role.FARMER) {
            Farm farm = Farm.builder()
                    .user(user)
                    .name(request.getFarmName().trim())
                    .region(request.getRegion().trim())
                    .category(request.getCategory().trim())
                    .certification(blankToNull(request.getCertification()))
                    .description(blankToNull(request.getDescription()))
                    .build();
            farmRepository.save(farm);
        }

        return issueTokens(user);
    }

    private void validateFarmFields(RegisterRequestDto request) {
        if (isBlank(request.getFarmName())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "농장명을 입력해주세요.");
        }
        if (isBlank(request.getRegion())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "지역을 입력해주세요.");
        }
        if (isBlank(request.getCategory())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "카테고리를 선택해주세요.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED,
                        "이메일 또는 비밀번호가 올바르지 않아요."));

        if (user.getPasswordHash() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED,
                    "소셜 로그인으로 가입된 계정이에요. 소셜 로그인을 이용해주세요.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED,
                    "이메일 또는 비밀번호가 올바르지 않아요.");
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponseDto completeOAuth2Register(OAuth2CompleteRequestDto request) {
        String tempToken = request.getTempToken();

        if (!jwtUtil.validate(tempToken) || !jwtUtil.isTempToken(tempToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "유효하지 않은 임시 토큰이에요. 소셜 로그인을 다시 시도해주세요.");
        }

        // ADMIN 역할 선택 차단
        if (request.getRole() == Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "해당 역할은 선택할 수 없어요.");
        }

        String email = jwtUtil.extractSubject(tempToken);
        String provider = jwtUtil.extractProvider(tempToken);
        String providerId = jwtUtil.extractProviderId(tempToken);

        if (socialAccountRepository.findByProviderAndProviderId(provider, providerId).isPresent()) {
            throw new BusinessException(ErrorCode.SOCIAL_ACCOUNT_EXISTS);
        }

        // 동일 이메일로 가입된 계정이 있으면 소셜 계정을 연동, 없으면 신규 생성
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .role(request.getRole())
                                .build()
                ));

        SocialAccount socialAccount = SocialAccount.builder()
                .user(user)
                .provider(provider)
                .providerId(providerId)
                .build();
        socialAccountRepository.save(socialAccount);

        return issueTokens(user);
    }

    private AuthResponseDto issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        return AuthResponseDto.of(accessToken, refreshToken, user);
    }

    // NIST SP 800-63B: 연속·반복 문자 4개 이상 차단
    private void validatePasswordStrength(String password) {
        for (int i = 0; i < password.length() - 3; i++) {
            char c = password.charAt(i);
            char c1 = password.charAt(i + 1);
            char c2 = password.charAt(i + 2);
            char c3 = password.charAt(i + 3);

            boolean repeated = (c == c1 && c1 == c2 && c2 == c3);
            boolean ascending = (c1 == c + 1 && c2 == c + 2 && c3 == c + 3);
            boolean descending = (c1 == c - 1 && c2 == c - 2 && c3 == c - 3);

            if (repeated || ascending || descending) {
                throw new BusinessException(ErrorCode.PASSWORD_TOO_SIMPLE,
                        "비밀번호에 연속되거나 반복된 문자를 사용할 수 없어요. (예: 1234, aaaa)");
            }
        }
    }
}
