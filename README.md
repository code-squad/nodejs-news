# IT 뉴스 사이트

---

#### 메인 페이지

![](https://user-images.githubusercontent.com/34808501/60937212-8487bf00-a30a-11e9-81be-dc8cbfd7a7f3.png)

### IT 분야별 뉴스 제공

- 방송/통신, 인터넷, 게임, 컴퓨팅, 홈/모바일 등

### 언론사별 뉴스 제공

- 블로터, ZDNet, 디지털 데일리, 디지털 타임즈 등

## 사용자 구분

> 관리자만 기사 업로드,수정,삭제 가능

- **관리자**
    - 뉴스 업로드, 수정, 삭제, 조회 가능
    - 댓글 달기, 좋아요 가능

- **일반 사용자**
    - 뉴스 조회 및 댓글 달기, 좋아요 가능

## 주요 기능

- 중요 정보는 `.env` 파일에 관리
    - `GITHUB_CLIENT_ID`
    - `GITHUB_CLIENT_SECRET`
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
      

- **회원가입**
    - 회원가입: `POST /auth/signup`

- **로그인**
    - 사용 모듈: `passport, express-session`
    - 로컬 로그인: `POST /auth/login`
    - OAuth 로그인
        - 구글 로그인: `POST /auth/google-login`
        - 깃헙 로그인: `POST /auth/github-login`
    - 로그아웃: `POST /auth/logout`

- **뉴스 CRUD**
    - 뉴스 조회: `GET /article/show/:articleId`
        - IT분야별 뉴스 조회: `GET /article/:field`
        - 언론사별 뉴스 조회: `GET /article/press/:press`
        
    - 뉴스 생성: `POST /article/add`
        - 기사 내 메인 이미지는 `image_url`을 통해 업로드 가능
        - 기사 내 서브 이미지는 본문에 붙여넣기 가능
    - 뉴스 수정:  `PUT /article/:articleId`
    - 뉴스 삭제:  `DELETE /article/:articleId`

- **좋아요**
    - 기사에 좋아요 버튼을 누를 수 있음
    - 기사 하나당 좋아요는 한 번만 가능
    - 기사 좋아요: `POST /article/acticleId/:act`

- **댓글**
    - 로그인 한 사용자만 댓글 달 수 있음 
    - 본인 댓글만 삭제 가능
    - 깃헙, 구글 로그인 한 경우 댓글 상단에 프로필 사진 표시
    - 댓글은 **depth 1**까지만 허용
    - 댓글 등록: `POST /comment/:commentId`
    - 댓글 삭제: `DELETE /comment/:commentId`

## 주요 페이지

- **회원가입 페이지**: `GET /auth/signup`
- **로그인 페이지**: `GET /auth/signin`
- **메인 페이지**: `GET /`
- **뉴스 게시물 페이지**
    - IT분야별 뉴스 페이지: `GET /article/:field`
    - 언론사별 뉴스 페이지: `GET /article/press/:press`

## DB 구조

![](https://user-images.githubusercontent.com/34808501/62781938-0d556e80-baf4-11e9-9b4e-d5dde65fcf53.png)

![](https://user-images.githubusercontent.com/34808501/62781910-f7e04480-baf3-11e9-938c-51bb5402cbde.png)

