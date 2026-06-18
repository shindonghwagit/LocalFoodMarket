package com.localfood.localfoodmarket.global.config;

import com.localfood.localfoodmarket.domain.farm.entity.Farm;
import com.localfood.localfoodmarket.domain.farm.repository.FarmRepository;
import com.localfood.localfoodmarket.domain.order.entity.Order;
import com.localfood.localfoodmarket.domain.order.entity.OrderItem;
import com.localfood.localfoodmarket.domain.order.entity.OrderStatus;
import com.localfood.localfoodmarket.domain.order.repository.OrderItemRepository;
import com.localfood.localfoodmarket.domain.order.repository.OrderRepository;
import com.localfood.localfoodmarket.domain.point.entity.PointLog;
import com.localfood.localfoodmarket.domain.point.entity.PointLogType;
import com.localfood.localfoodmarket.domain.point.repository.PointLogRepository;
import com.localfood.localfoodmarket.domain.post.entity.Comment;
import com.localfood.localfoodmarket.domain.post.entity.Post;
import com.localfood.localfoodmarket.domain.post.entity.PostProduct;
import com.localfood.localfoodmarket.domain.post.repository.CommentRepository;
import com.localfood.localfoodmarket.domain.post.repository.PostRepository;
import com.localfood.localfoodmarket.domain.product.entity.Product;
import com.localfood.localfoodmarket.domain.product.repository.ProductRepository;
import com.localfood.localfoodmarket.domain.review.entity.Review;
import com.localfood.localfoodmarket.domain.review.repository.ReviewRepository;
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
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PointLogRepository pointLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@localfood.com")) {
            log.info("[DataInitializer] 더미 데이터가 이미 존재합니다. 건너뜁니다.");
            return;
        }

        log.info("[DataInitializer] 더미 데이터를 생성합니다.");

        createAdmin();
        List<Farm>    farms     = createFarms();
        List<Product> products  = createProducts(farms);
        List<User>    consumers = createConsumers();
        List<Order>   doneOrders = createOrders(consumers, products);
        createReviews(consumers, doneOrders, products);
        createPosts(consumers, products);

        log.info("[DataInitializer] 더미 데이터 생성 완료. " +
                "농가 {}, 상품 {}, 소비자 {}, 주문 {}, 리뷰 {}, 게시글 {}",
                farms.size(), products.size(), consumers.size(),
                orderRepository.count(), reviewRepository.count(), postRepository.count());
    }

    /* ── 관리자 ─────────────────────────────────────────────────────────── */
    private void createAdmin() {
        userRepository.save(User.builder()
                .email("admin@localfood.com")
                .passwordHash(passwordEncoder.encode("adminpassword12"))
                .role(Role.ADMIN)
                .build());
    }

    /* ── 농가 10개 ──────────────────────────────────────────────────────── */
    private List<Farm> createFarms() {
        record FD(String email, String name, String region, String category, String cert, String desc) {}

        List<FD> data = List.of(
            new FD("farm1@localfood.com", "청솔농장", "충남 아산", "채소", "무농약",
                "충남 아산의 맑은 공기와 비옥한 토양에서 자란 무농약 채소를 직접 보내드립니다."),
            new FD("farm2@localfood.com", "사과골농원", "경북 영주", "과일", "유기농",
                "해발 500m 고지대에서 일교차를 이용해 키운 달콤한 사과를 만나보세요."),
            new FD("farm3@localfood.com", "베리팜", "전남 담양", "과일", "GAP인증",
                "대나무 숲 사이 맑은 물로 자란 신선한 베리류 과일을 직접 공급합니다."),
            new FD("farm4@localfood.com", "구름농원", "강원 홍천", "채소", "유기농",
                "청정 강원도 홍천의 유기농 채소 농장입니다. 농약 없이 자연 그대로 재배합니다."),
            new FD("farm5@localfood.com", "황토감자밭", "강원 정선", "채소", "무농약",
                "정선의 황토 땅에서 자란 속이 꽉 찬 감자와 고구마를 드셔보세요."),
            new FD("farm6@localfood.com", "제주감귤농원", "제주 서귀포", "과일", "GAP인증",
                "제주 서귀포의 따뜻한 햇살과 화산토에서 자란 프리미엄 감귤을 보내드립니다."),
            new FD("farm7@localfood.com", "대관령목장", "강원 평창", "유제품", "유기농",
                "대관령 고산지대의 청정 환경에서 방목 사육한 젖소의 유기농 유제품입니다."),
            new FD("farm8@localfood.com", "황금쌀농장", "전남 해남", "곡류", "친환경",
                "해남 황금들판에서 정성껏 재배한 친환경 쌀을 직접 도정해 보내드립니다."),
            new FD("farm9@localfood.com", "남해수산", "경남 남해", "수산물", "이력제",
                "남해 청정 바다에서 직접 어획하거나 양식한 수산물을 신선하게 배송합니다."),
            new FD("farm10@localfood.com", "한우마을", "충북 음성", "육류", "HACCP",
                "음성 한우마을에서 직접 키운 한우를 HACCP 시설에서 처리하여 보내드립니다.")
        );

        List<Farm> farms = new ArrayList<>();
        for (FD d : data) {
            User user = userRepository.save(User.builder()
                    .email(d.email())
                    .passwordHash(passwordEncoder.encode("farmerpass12"))
                    .role(Role.FARMER)
                    .build());
            Farm farm = Farm.builder()
                    .user(user).name(d.name()).region(d.region())
                    .category(d.category()).certification(d.cert()).description(d.desc())
                    .build();
            farm.approve();
            farms.add(farmRepository.save(farm));
        }
        return farms;
    }

    /* ── 상품 30개 (농가당 3개) ─────────────────────────────────────────── */
    private List<Product> createProducts(List<Farm> farms) {
        record PD(String name, int price, int stock, String cat, LocalDate harvest, String desc) {}

        List<List<PD>> all = List.of(
            // 0: 청솔농장 (채소)
            List.of(
                new PD("유기농 배추", 3500, 30, "채소", LocalDate.of(2025, 10, 5),
                    "속이 꽉 찬 무농약 배추. 김치, 국, 볶음 등 다양하게 활용하세요."),
                new PD("당근 1kg", 4200, 20, "채소", LocalDate.of(2025, 10, 8),
                    "당도 높은 무농약 당근. 생으로 먹거나 주스로 드셔도 좋아요."),
                new PD("양파 3kg", 6000, 15, "채소", LocalDate.of(2025, 10, 3),
                    "매운맛이 적고 단맛이 강한 아산 양파입니다.")
            ),
            // 1: 사과골농원 (과일)
            List.of(
                new PD("홍옥 사과 2kg", 12000, 25, "과일", LocalDate.of(2025, 10, 10),
                    "새콤달콤한 홍옥 사과. 피부 건강에 좋은 폴리페놀이 풍부합니다."),
                new PD("부사 사과 3kg", 15000, 20, "과일", LocalDate.of(2025, 10, 12),
                    "영주 고지대에서 자란 달콤한 부사 사과. 저장성이 뛰어납니다."),
                new PD("배 2kg", 13000, 10, "과일", LocalDate.of(2025, 10, 7),
                    "아삭아삭하고 즙이 많은 신고배. 소화에 도움을 줍니다.")
            ),
            // 2: 베리팜 (과일)
            List.of(
                new PD("블루베리 500g", 8000, 30, "과일", LocalDate.of(2025, 8, 20),
                    "항산화 성분이 풍부한 신선한 블루베리. 냉동 보관 가능합니다."),
                new PD("딸기 1kg", 9000, 25, "과일", LocalDate.of(2025, 6, 15),
                    "빨갛고 탐스러운 담양 딸기. 당도 13브릭스 이상 보장합니다."),
                new PD("복분자 500g", 7000, 20, "과일", LocalDate.of(2025, 7, 10),
                    "전남 담양 청정 지역에서 자란 복분자. 원기 회복에 탁월합니다.")
            ),
            // 3: 구름농원 (채소)
            List.of(
                new PD("방울토마토 500g", 5500, 40, "채소", LocalDate.of(2025, 9, 20),
                    "유기농으로 재배한 달콤한 방울토마토. 리코펜이 풍부합니다."),
                new PD("오이 10개", 4000, 35, "채소", LocalDate.of(2025, 9, 18),
                    "아삭한 식감의 유기농 오이. 다이어트에도 좋아요."),
                new PD("애호박 3개", 3500, 25, "채소", LocalDate.of(2025, 9, 22),
                    "부드럽고 달콤한 홍천 유기농 애호박입니다.")
            ),
            // 4: 황토감자밭 (채소)
            List.of(
                new PD("감자 3kg", 6500, 35, "채소", LocalDate.of(2025, 8, 15),
                    "황토에서 자란 포슬포슬한 감자. 전, 볶음, 국 모두 맛있어요."),
                new PD("고구마 2kg", 7000, 30, "채소", LocalDate.of(2025, 10, 1),
                    "꿀처럼 달콤한 정선 황토 고구마. 구워도 쪄도 맛있습니다."),
                new PD("옥수수 6개", 5000, 20, "채소", LocalDate.of(2025, 8, 10),
                    "찰기가 있고 달콤한 찰옥수수. 쪄서 드시면 최고예요.")
            ),
            // 5: 제주감귤농원 (과일)
            List.of(
                new PD("천혜향 2kg", 18000, 15, "과일", LocalDate.of(2026, 1, 15),
                    "껍질이 얇고 즙이 풍부한 제주 천혜향. 비타민 C가 풍부합니다."),
                new PD("한라봉 2kg", 16000, 20, "과일", LocalDate.of(2026, 2, 1),
                    "제주 서귀포 직송 한라봉. 새콤달콤한 맛이 일품입니다."),
                new PD("황금향 1.5kg", 14000, 18, "과일", LocalDate.of(2026, 1, 20),
                    "황금빛 껍질의 새로운 프리미엄 감귤. 달콤함이 가득합니다.")
            ),
            // 6: 대관령목장 (유제품)
            List.of(
                new PD("유기농 우유 1L", 4500, 50, "유제품", LocalDate.of(2025, 11, 1),
                    "대관령 방목 유기농 우유. 신선함을 바로 느끼실 수 있습니다."),
                new PD("수제 버터 200g", 12000, 20, "유제품", LocalDate.of(2025, 10, 25),
                    "목장에서 직접 만든 무염 수제 버터. 풍미가 남다릅니다."),
                new PD("치즈 200g", 15000, 15, "유제품", LocalDate.of(2025, 10, 20),
                    "대관령 우유로 만든 국산 자연 치즈. 고소한 맛이 좋습니다.")
            ),
            // 7: 황금쌀농장 (곡류)
            List.of(
                new PD("친환경 쌀 5kg", 22000, 30, "곡류", LocalDate.of(2025, 10, 20),
                    "해남 황금들판의 친환경 햅쌀. 갓 도정해 윤기가 납니다."),
                new PD("현미 3kg", 12000, 25, "곡류", LocalDate.of(2025, 10, 20),
                    "식이섬유 풍부한 친환경 현미. 건강한 밥상을 만들어드립니다."),
                new PD("흑미 2kg", 14000, 20, "곡류", LocalDate.of(2025, 10, 20),
                    "안토시아닌이 풍부한 흑미. 쌀과 섞어 드시면 맛있습니다.")
            ),
            // 8: 남해수산 (수산물)
            List.of(
                new PD("멸치 300g", 8500, 30, "수산물", LocalDate.of(2025, 9, 10),
                    "남해 청정 바다에서 잡은 신선한 멸치. 볶음, 국물 모두 최고."),
                new PD("미역 200g", 6000, 35, "수산물", LocalDate.of(2025, 9, 5),
                    "남해 자연산 미역. 국, 냉채, 비빔밥 등에 활용하세요."),
                new PD("다시마 200g", 7500, 25, "수산물", LocalDate.of(2025, 9, 8),
                    "깊은 맛의 국물을 내는 남해 자연산 다시마입니다.")
            ),
            // 9: 한우마을 (육류)
            List.of(
                new PD("한우 등심 500g", 65000, 10, "육류", LocalDate.of(2025, 10, 15),
                    "1++ 등급 한우 등심. 부드럽고 고소한 마블링이 일품입니다."),
                new PD("한우 갈비 1kg", 45000, 8, "육류", LocalDate.of(2025, 10, 15),
                    "진한 맛의 한우 갈비. 구이, 찜 모두 맛있습니다."),
                new PD("돼지 삼겹살 1kg", 18000, 20, "육류", LocalDate.of(2025, 10, 15),
                    "음성 농장에서 직접 키운 돼지 삼겹살. 두툼하고 맛있습니다.")
            )
        );

        List<Product> result = new ArrayList<>();
        for (int i = 0; i < farms.size(); i++) {
            for (PD pd : all.get(i)) {
                result.add(productRepository.save(Product.builder()
                        .farm(farms.get(i)).name(pd.name()).price(pd.price())
                        .stock(pd.stock()).category(pd.cat())
                        .harvestDate(pd.harvest()).description(pd.desc())
                        .build()));
            }
        }
        return result; // index: farm*3 + 0~2
    }

    /* ── 소비자 5명 ─────────────────────────────────────────────────────── */
    private List<User> createConsumers() {
        record CD(String email, int points) {}
        List<CD> data = List.of(
            new CD("consumer1@localfood.com", 200000),
            new CD("consumer2@localfood.com", 150000),
            new CD("consumer3@localfood.com", 100000),
            new CD("consumer4@localfood.com",  80000),
            new CD("consumer5@localfood.com",  50000)
        );

        List<User> consumers = new ArrayList<>();
        for (CD d : data) {
            User user = User.builder()
                    .email(d.email())
                    .passwordHash(passwordEncoder.encode("consumerpass12"))
                    .role(Role.CONSUMER)
                    .build();
            user.chargePoint(d.points());
            userRepository.save(user);
            pointLogRepository.save(PointLog.builder()
                    .user(user).amount(d.points()).type(PointLogType.CHARGE).build());
            consumers.add(user);
        }
        return consumers;
    }

    /* ── 주문 20개 ──────────────────────────────────────────────────────── */
    private List<Order> createOrders(List<User> consumers, List<Product> products) {
        record OD(int ci, int pi, int qty, OrderStatus status, String addr) {}

        List<OD> data = List.of(
            // DONE 6건 (리뷰 작성 대상)
            new OD(0,  0, 2, OrderStatus.SETTLED,     "서울 마포구 합정동 123"),
            new OD(0,  6, 3, OrderStatus.SETTLED,     "서울 마포구 합정동 123"),
            new OD(1,  3, 1, OrderStatus.SETTLED,     "부산 해운대구 우동 456"),
            new OD(2, 21, 2, OrderStatus.SETTLED,     "대구 수성구 범어동 789"),
            new OD(3,  9, 4, OrderStatus.SETTLED,     "인천 남동구 구월동 321"),
            new OD(4, 12, 2, OrderStatus.SETTLED,     "광주 서구 치평동 654"),
            // SHIPPING 4건
            new OD(0, 27, 1, OrderStatus.SHIPPING, "서울 마포구 합정동 123"),
            new OD(1, 15, 2, OrderStatus.SHIPPING, "부산 해운대구 우동 456"),
            new OD(2, 18, 3, OrderStatus.SHIPPING, "대구 수성구 범어동 789"),
            new OD(3,  2, 2, OrderStatus.SHIPPING, "인천 남동구 구월동 321"),
            // PAID 5건
            new OD(0,  4, 2, OrderStatus.PAID,     "서울 마포구 합정동 123"),
            new OD(1,  7, 1, OrderStatus.PAID,     "부산 해운대구 우동 456"),
            new OD(3, 24, 3, OrderStatus.PAID,     "인천 남동구 구월동 321"),
            new OD(4,  1, 2, OrderStatus.PAID,     "광주 서구 치평동 654"),
            new OD(2, 13, 1, OrderStatus.PAID,     "대구 수성구 범어동 789"),
            // PENDING 5건
            new OD(0, 19, 1, OrderStatus.PAID,  "서울 마포구 합정동 123"),
            new OD(1, 22, 2, OrderStatus.PAID,  "부산 해운대구 우동 456"),
            new OD(3, 28, 1, OrderStatus.PAID,  "인천 남동구 구월동 321"),
            new OD(4,  5, 1, OrderStatus.PAID,  "광주 서구 치평동 654"),
            new OD(2, 10, 2, OrderStatus.PAID,  "대구 수성구 범어동 789")
        );

        List<Order> doneOrders = new ArrayList<>();
        for (OD d : data) {
            Product product = products.get(d.pi());
            int total = product.getPrice() * d.qty();

            Order order = orderRepository.save(Order.builder()
                    .user(consumers.get(d.ci()))
                    .totalPrice(total)
                    .status(d.status())
                    .deliveryAddress(d.addr())
                    .build());

            orderItemRepository.save(OrderItem.builder()
                    .order(order).product(product)
                    .quantity(d.qty()).priceAtOrder(product.getPrice())
                    .build());

            if (d.status() == OrderStatus.SETTLED) doneOrders.add(order);
        }
        return doneOrders;
    }

    /* ── 리뷰 6건 ───────────────────────────────────────────────────────── */
    private void createReviews(List<User> consumers, List<Order> doneOrders, List<Product> products) {
        record RD(int orderIdx, int productIdx, int consumerIdx, int rating, String content) {}

        List<RD> data = List.of(
            new RD(0,  0, 0, 5, "아산 배추 정말 신선해요! 김치 담갔는데 너무 맛있었습니다. 다음에도 꼭 구매할게요."),
            new RD(1,  6, 0, 5, "블루베리가 알이 굵고 신선합니다. 아이들이 너무 좋아해요. 강력 추천!"),
            new RD(2,  3, 1, 4, "사과 달콤하고 맛있어요. 포장도 꼼꼼하게 해주셔서 좋았습니다."),
            new RD(3, 21, 2, 5, "해남 쌀 진짜 맛있어요. 밥이 윤기 흐르고 쫄깃합니다. 재구매 의사 100%"),
            new RD(4,  9, 3, 4, "방울토마토 당도가 높아서 좋아요. 아이들 간식으로 딱이에요."),
            new RD(5, 12, 4, 5, "정선 황토 감자 최고입니다! 감자전 해먹었는데 정말 맛있었어요.")
        );

        for (RD d : data) {
            reviewRepository.save(Review.builder()
                    .user(consumers.get(d.consumerIdx()))
                    .product(products.get(d.productIdx()))
                    .order(doneOrders.get(d.orderIdx()))
                    .rating(d.rating())
                    .content(d.content())
                    .build());
        }
    }

    /* ── 게시글 15개 + 댓글 ──────────────────────────────────────────────── */
    private void createPosts(List<User> consumers, List<Product> products) {

        // 구매후기 5개
        post(consumers.get(0), "구매후기",
            "아산 무농약 배추로 김치 담갔어요",
            "오늘 청솔농장 배추로 김치를 담갔는데 정말 신선하고 맛있어요!\n" +
            "잎이 크고 속이 꽉 차 있어서 놀랐습니다. 무농약이라 믿을 수 있고요.\n" +
            "가격도 마트보다 저렴해서 너무 만족스럽습니다. 다음엔 당근도 주문해볼 예정이에요!",
            24, 156, List.of(products.get(0)), consumers,
            new String[]{"1", "저도 같은 농장 배추로 김치 담갔는데 맛있었어요!"},
            new String[]{"2", "어디서 주문하셨나요? 저도 구매하고 싶어요"},
            new String[]{"0", "청솔농장이에요! 여기 앱에서 주문하시면 돼요~"});

        post(consumers.get(1), "구매후기",
            "제주 천혜향 도착했습니다",
            "드디어 제주 천혜향이 도착했어요. 박스 열자마자 달콤한 향기가 퍼지더라고요.\n" +
            "껍질이 정말 얇고 과육이 꽉 차있어요. 즙이 엄청 많이 나오고 새콤달콤합니다.\n" +
            "가족 모두 너무 맛있다고 난리났어요. 제주에서 직송이라 신선도가 다르네요!",
            31, 203, List.of(products.get(15)), consumers,
            new String[]{"2", "천혜향 맛있죠! 저도 매년 사먹어요"},
            new String[]{"3", "포장은 어떻게 되어있나요? 선물로 보내려고요"},
            new String[]{"1", "박스 포장 깔끔해서 선물용으로도 딱이에요!"});

        post(consumers.get(2), "구매후기",
            "대관령 유기농 우유, 일반 우유랑 달라요",
            "처음엔 반신반의했는데 진짜 맛이 다르네요.\n" +
            "고소하고 진한 맛이 시중 우유랑 확실히 차이가 납니다.\n" +
            "아이들한테 좋은 거 먹이고 싶어서 구매했는데 잘 한 것 같아요.",
            18, 142, List.of(products.get(18)), consumers,
            new String[]{"0", "맞아요 방목 우유는 확실히 다르더라고요"},
            new String[]{"4", "유통기한은 얼마나 되나요?"});

        post(consumers.get(3), "구매후기",
            "한우 등심 직거래로 사봤어요",
            "생일 기념으로 한우 등심 주문했는데 마블링이 정말 예쁘네요!\n" +
            "집에서 구워 먹었는데 식당 부럽지 않은 맛이었어요.\n" +
            "가격이 좀 나가지만 이 정도 퀄리티면 충분히 가치 있는 것 같습니다.",
            42, 287, List.of(products.get(27)), consumers,
            new String[]{"1", "한우 직거래로 사면 많이 저렴하죠!"},
            new String[]{"2", "어떻게 구우셨어요? 팁 좀 알려주세요"},
            new String[]{"3", "소금 후추만 뿌려서 강불에 빠르게 구웠어요!"});

        post(consumers.get(4), "구매후기",
            "해남 햅쌀 진짜 맛있어요",
            "오래된 쌀 특유의 냄새가 전혀 없고 밥을 지으면 윤기가 좔좔 흘러요.\n" +
            "밥 자체가 달콤하고 쫄깃해서 반찬 없이도 맛있게 먹을 수 있어요.\n" +
            "5kg이라 양이 좀 있지만 금방 없어질 것 같아요!",
            15, 118, List.of(products.get(21)), consumers,
            new String[]{"0", "해남 쌀 유명하죠! 저도 매년 주문해요"});

        // 레시피 4개
        post(consumers.get(0), "레시피",
            "간단한 배추 된장국 레시피 공유해요",
            "재료: 배추 1/4통, 된장 2스푼, 다진 마늘, 대파\n\n" +
            "1. 배추를 먹기 좋게 자릅니다\n" +
            "2. 멸치 육수를 끓여줍니다\n" +
            "3. 된장을 풀어주세요\n" +
            "4. 배추와 마늘을 넣고 10분 끓여줍니다\n" +
            "5. 대파 썰어 넣고 마무리!\n\n" +
            "청솔농장 배추로 만들었더니 배추 향이 진하고 국이 더 맛있었어요.",
            27, 198, List.of(products.get(0)), consumers,
            new String[]{"1", "레시피 감사해요! 따라해볼게요"},
            new String[]{"2", "멸치 육수 대신 다시마 육수 써도 맛있더라고요"},
            new String[]{"3", "저도 이 배추로 만들었는데 진짜 맛있었어요!"});

        post(consumers.get(1), "레시피",
            "블루베리 스무디 만드는 법",
            "블루베리 스무디 정말 간단하게 만들 수 있어요!\n\n" +
            "재료: 블루베리 200g, 바나나 1개, 우유 200ml, 꿀 1스푼\n\n" +
            "1. 모든 재료를 블렌더에 넣어주세요\n" +
            "2. 30초 갈아주면 완성!\n\n" +
            "베리팜 블루베리가 알이 굵고 달콤해서 스무디 만들기 딱 좋아요.",
            33, 241, List.of(products.get(6)), consumers,
            new String[]{"3", "요거트 넣어도 맛있어요!"},
            new String[]{"4", "얼려서 넣으면 더 시원하게 즐길 수 있어요"});

        post(consumers.get(2), "레시피",
            "고구마 맛탕 레시피",
            "아이들이 좋아하는 고구마 맛탕!\n\n" +
            "재료: 고구마 2개, 식용유, 설탕 4스푼, 물 2스푼, 참깨\n\n" +
            "1. 고구마를 한 입 크기로 자릅니다\n" +
            "2. 170도 기름에 10분 튀겨줍니다\n" +
            "3. 팬에 설탕+물을 녹여 캐러멜을 만들어요\n" +
            "4. 튀긴 고구마를 캐러멜에 버무려주세요\n" +
            "5. 참깨 뿌려서 완성!\n\n" +
            "황토감자밭 고구마가 달콤해서 맛탕이 정말 맛있어요.",
            20, 175, List.of(products.get(13)), consumers,
            new String[]{"0", "오 맛있겠다! 주말에 해봐야겠어요"},
            new String[]{"1", "에어프라이어로 해도 되나요?"});

        post(consumers.get(3), "레시피",
            "감자전 황금 레시피",
            "바삭바삭한 감자전 레시피예요!\n\n" +
            "재료: 감자 3개, 소금, 식용유\n\n" +
            "1. 감자를 강판에 갈아줍니다\n" +
            "2. 체에 밭쳐 전분을 따로 모아둡니다\n" +
            "3. 갈은 감자와 전분, 소금을 섞어요\n" +
            "4. 달군 팬에 기름 두르고 부쳐줍니다\n\n" +
            "정선 황토 감자라 전분이 많이 나와서 바삭하게 잘 부쳐져요!",
            38, 312, List.of(products.get(12)), consumers,
            new String[]{"4", "양파 조금 넣어도 맛있어요!"},
            new String[]{"2", "감자 비율이 중요하죠 ㅎㅎ"},
            new String[]{"0", "진짜 맛있어보여요 따라해볼게요!"});

        // 정보공유 3개
        post(consumers.get(4), "정보공유",
            "GAP 인증이 뭔지 아세요?",
            "GAP(Good Agricultural Practices)은 농산물의 생산부터 출하까지\n" +
            "안전 관리 기준을 인증하는 제도예요.\n\n" +
            "농약 잔류, 중금속, 미생물 등의 위해요소를 철저히 관리하는 농가에게 주어집니다.\n\n" +
            "유기농과 다른 점은 화학농약이나 비료를 사용할 수 있지만\n" +
            "안전 기준치 이하로 관리된다는 점이에요.\n" +
            "유기농보다 가격이 저렴하면서도 안전하게 관리된 농산물을 구매할 수 있어 좋은 제도입니다.",
            15, 342, List.of(), consumers,
            new String[]{"0", "유용한 정보 감사해요!"},
            new String[]{"1", "GAP 인증이 무농약이랑 다른 건가요?"},
            new String[]{"4", "맞아요. 무농약은 농약 미사용, GAP는 안전 관리 기준이에요"});

        post(consumers.get(0), "정보공유",
            "직거래 플랫폼 이용 꿀팁 모음",
            "직거래 플랫폼 사용하면서 알게 된 꿀팁들을 공유해요!\n\n" +
            "1. 수확일 확인하기: 가능하면 최근 수확한 걸 구매하세요.\n\n" +
            "2. 농가 리뷰 확인: 구매 전 다른 분들의 리뷰를 꼭 확인해보세요.\n\n" +
            "3. 포인트 활용: 포인트 충전 후 편리하게 구매하세요.\n\n" +
            "4. 커뮤니티 활용: 구매 전 커뮤니티에서 정보를 얻으면 좋아요!",
            22, 289, List.of(), consumers,
            new String[]{"2", "꿀팁 감사해요!"},
            new String[]{"3", "리뷰 확인이 중요하죠 ㅎㅎ"});

        post(consumers.get(1), "정보공유",
            "제철 농산물 정리해봤어요",
            "제철 농산물이 왜 좋을까요?\n\n" +
            "봄(3~5월): 딸기, 봄나물, 아스파라거스\n" +
            "여름(6~8월): 복숭아, 수박, 토마토, 오이\n" +
            "가을(9~11월): 사과, 배, 감, 고구마, 감자\n" +
            "겨울(12~2월): 귤, 한라봉, 천혜향, 배추\n\n" +
            "제철에 구매하면 맛도 좋고 가격도 저렴합니다!",
            19, 256, List.of(), consumers,
            new String[]{"4", "이런 정보 정말 유용해요!"},
            new String[]{"0", "딸기 제철이 생각보다 짧더라고요"});

        // 질문 3개
        post(consumers.get(2), "질문",
            "블루베리 냉동 보관 방법 알려주세요",
            "블루베리를 많이 샀는데 다 먹기 전에 상할 것 같아요.\n" +
            "냉동 보관할 때 어떻게 하는 게 좋을까요?\n" +
            "씻고 얼려야 하나요 아니면 그냥 얼려야 하나요?",
            8, 94, List.of(products.get(6)), consumers,
            new String[]{"0", "씻지 말고 바로 냉동하세요! 먹을 때 씻으면 돼요"},
            new String[]{"1", "한 번 쓸 양씩 소분해서 지퍼백에 넣어 얼리면 편해요"},
            new String[]{"3", "저도 그렇게 하는데 6개월 이상 먹었어요!"});

        post(consumers.get(3), "질문",
            "포인트 충전 후 주문이 안 되는데요",
            "포인트 충전했는데 상품 주문할 때 포인트가 부족하다고 나와요.\n" +
            "충전은 됐다고 나오는데 이상하네요.\n" +
            "혹시 같은 경험 있으신 분 있나요?",
            5, 67, List.of(), consumers,
            new String[]{"4", "앱 껐다 다시 켜보세요!"},
            new String[]{"0", "저도 그런 적 있었는데 새로고침하니 해결됐어요"},
            new String[]{"3", "해결됐어요! 새로고침하니 반영됐네요 감사합니다"});

        post(consumers.get(4), "질문",
            "배송은 보통 얼마나 걸리나요?",
            "처음 주문해보는데 배송이 얼마나 걸리는지 모르겠어요.\n" +
            "지방에서 서울로 오는 경우 신선도 괜찮을까요?",
            12, 103, List.of(), consumers,
            new String[]{"1", "보통 1~3일 내 도착해요"},
            new String[]{"2", "아이스팩이나 냉동 포장해서 보내줘서 신선하게 왔어요"},
            new String[]{"0", "저는 제주도 감귤도 신선하게 왔어요!"});
    }

    private void post(User author, String category, String title, String content,
                      int likes, int views, List<Product> tagProducts,
                      List<User> consumers, String[]... comments) {
        Post p = postRepository.save(Post.builder()
                .user(author).title(title).content(content).category(category)
                .build());

        for (Product product : tagProducts) {
            p.addTaggedProduct(PostProduct.builder().post(p).product(product).build());
        }
        for (int i = 0; i < likes; i++) p.incrementLikes();
        for (int i = 0; i < views; i++) p.incrementViewCount();

        for (String[] c : comments) {
            commentRepository.save(Comment.builder()
                    .post(p).user(consumers.get(Integer.parseInt(c[0]))).content(c[1])
                    .build());
        }
    }
}
