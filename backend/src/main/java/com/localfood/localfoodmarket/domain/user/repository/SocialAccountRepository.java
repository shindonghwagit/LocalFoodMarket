package com.localfood.localfoodmarket.domain.user.repository;

import com.localfood.localfoodmarket.domain.user.entity.SocialAccount;
import com.localfood.localfoodmarket.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    Optional<SocialAccount> findByProviderAndProviderId(String provider, String providerId);

    List<SocialAccount> findByUser(User user);
}
