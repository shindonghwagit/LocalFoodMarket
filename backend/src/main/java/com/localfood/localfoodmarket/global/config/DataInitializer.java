package com.localfood.localfoodmarket.global.config;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.product.repository.ProductRepository;
import com.localfood.localfoodmarket.domain.user.entity.Role;
import com.localfood.localfoodmarket.domain.user.entity.User;
import com.localfood.localfoodmarket.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@localfood.com")) {
            log.info("[DataInitializer] 시드 데이터가 이미 존재합니다. 건너뜁니다.");
            return;
        }

        log.info("[DataInitializer] 시드 데이터를 생성합니다.");

        createAdmin();
        Farm farm1 = createFarm1();
        Farm farm2 = createFarm2();
        Farm farm3 = createFarm3();
        createProductsFor(farm1);
        createProductsFor(farm2);
        createProductsFor(farm3);
        createConsumers();

        log.info("[DataInitializer] 시드 데이터 생성 완료.");
    }

    private void createAdmin() {
        User admin = User.builder()
                .email("admin@localfood.com")
                .passwordHash(passwordEncoder.encode("adminpassword12"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);
    }

    private Farm createFarm1() {
        User user = User.builder()
                .email("farm1@localfood.com")
                .passwordHash(passwordEncoder.encode("farmerpass12"))
                .role(Role.FARMER)
                .build();
        userRepository.save(user);

        Farm farm = Farm.builder()
                .user(user)
                .name("청솔농장")
                .region("충남 아산")
                .category("채소")
                .certification("무농약")
                .build();
        farm.approve();
        return farmRepository.save(farm);
    }

    private Farm createFarm2() {
        User user = User.builder()
                .email("farm2@localfood.com")
                .passwordHash(passwordEncoder.encode("farmerpass12"))
                .role(Role.FARMER)
                .build();
        userRepository.save(user);

        Farm farm = Farm.builder()
                .user(user)
                .name("사과골농원")
                .region("경북 영주")
                .category("과일")
                .certification("유기농")
                .build();
        farm.approve();
        return farmRepository.save(farm);
    }

    private Farm createFarm3() {
        User user = User.builder()
                .email("farm3@localfood.com")
                .passwordHash(passwordEncoder.encode("farmerpass12"))
                .role(Role.FARMER)
                .build();
        userRepository.save(user);

        Farm farm = Farm.builder()
                .user(user)
                .name("베리팜")
                .region("전남 담양")
                .category("과일")
                .certification("GAP인증")
                .build();
        farm.approve();
        return farmRepository.save(farm);
    }

    private void createProductsFor(Farm farm) {
        switch (farm.getName()) {
            case "청솔농장" -> {
                productRepository.save(product(farm, "유기농 배추", 3500, 30, "채소", LocalDate.of(2025, 10, 5)));
                productRepository.save(product(farm, "당근 1kg", 4200, 20, "채소", LocalDate.of(2025, 10, 8)));
                productRepository.save(product(farm, "양파 3kg", 6000, 15, "채소", LocalDate.of(2025, 10, 3)));
            }
            case "사과골농원" -> {
                productRepository.save(product(farm, "홍옥 사과 2kg", 12000, 25, "과일", LocalDate.of(2025, 10, 10)));
                productRepository.save(product(farm, "부사 사과 3kg", 15000, 20, "과일", LocalDate.of(2025, 10, 12)));
                productRepository.save(product(farm, "배 2kg", 13000, 10, "과일", LocalDate.of(2025, 10, 7)));
            }
            case "베리팜" -> {
                productRepository.save(product(farm, "블루베리 500g", 8000, 30, "과일", LocalDate.of(2025, 8, 20)));
                productRepository.save(product(farm, "딸기 1kg", 9000, 25, "과일", LocalDate.of(2025, 6, 15)));
                productRepository.save(product(farm, "복분자 500g", 7000, 20, "과일", LocalDate.of(2025, 7, 10)));
            }
        }
    }

    private Product product(Farm farm, String name, int price, int stock,
                            String category, LocalDate harvestDate) {
        return Product.builder()
                .farm(farm)
                .name(name)
                .price(price)
                .stock(stock)
                .category(category)
                .harvestDate(harvestDate)
                .build();
    }

    private void createConsumers() {
        User consumer1 = User.builder()
                .email("consumer1@localfood.com")
                .passwordHash(passwordEncoder.encode("consumerpass12"))
                .role(Role.CONSUMER)
                .build();
        consumer1.chargePoint(50000);
        userRepository.save(consumer1);

        User consumer2 = User.builder()
                .email("consumer2@localfood.com")
                .passwordHash(passwordEncoder.encode("consumerpass12"))
                .role(Role.CONSUMER)
                .build();
        consumer2.chargePoint(30000);
        userRepository.save(consumer2);
    }
}
