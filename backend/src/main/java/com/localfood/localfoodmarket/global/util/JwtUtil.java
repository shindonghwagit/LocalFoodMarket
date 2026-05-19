package com.localfood.localfoodmarket.global.util;

import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.global.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_PROVIDER = "provider";
    private static final String CLAIM_PROVIDER_ID = "providerId";
    private static final String TEMP_TOKEN_TYPE = "temp";
    private static final long TEMP_TOKEN_EXPIRATION = 10 * 60 * 1000L; // 10분

    private final JwtConfig jwtConfig;

    public String generateAccessToken(Long userId, String email, Role role) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim(CLAIM_EMAIL, email)
                .claim(CLAIM_ROLE, role.name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getAccessExpiration()))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getRefreshExpiration()))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validate(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long extractUserId(String token) {
        return Long.valueOf(getClaims(token).getSubject());
    }

    public Role extractRole(String token) {
        return Role.valueOf(getClaims(token).get(CLAIM_ROLE, String.class));
    }

    public String extractEmail(String token) {
        return getClaims(token).get(CLAIM_EMAIL, String.class);
    }

    // ── TempToken (소셜 신규 가입용) ─────────────────────────────────────────

    public String generateTempToken(String email, String provider, String providerId) {
        return Jwts.builder()
                .subject(email)
                .claim(CLAIM_TYPE, TEMP_TOKEN_TYPE)
                .claim(CLAIM_PROVIDER, provider)
                .claim(CLAIM_PROVIDER_ID, providerId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + TEMP_TOKEN_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTempToken(String token) {
        return TEMP_TOKEN_TYPE.equals(getClaims(token).get(CLAIM_TYPE, String.class));
    }

    public String extractSubject(String token) {
        return getClaims(token).getSubject();
    }

    public String extractProvider(String token) {
        return getClaims(token).get(CLAIM_PROVIDER, String.class);
    }

    public String extractProviderId(String token) {
        return getClaims(token).get(CLAIM_PROVIDER_ID, String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
    }
}
