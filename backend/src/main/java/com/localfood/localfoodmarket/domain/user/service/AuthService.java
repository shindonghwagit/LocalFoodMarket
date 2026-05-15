package com.localfood.localfoodmarket.domain.user.service;

import com.localfood.localfoodmarket.domain.user.dto.AuthResponseDto;
import com.localfood.localfoodmarket.domain.user.dto.LoginRequestDto;
import com.localfood.localfoodmarket.domain.user.dto.RegisterRequestDto;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        validatePasswordStrength(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);

        return issueTokens(user);
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
