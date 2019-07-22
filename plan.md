## node.js news site 기획서

---

### 페이지 목록

1. 메인 페이지 : /
2. 로그인 페이지 : /login
3. 회원가입 페이지 : /signup
4. 글작성 페이지 : /write
5. 기사 페이지 : /article
6. 사용자정보 페이지 : /users

---

### API

1. 페이지
    * GET / : 메인페이지
    * GET /login : 로그인 페이지 
    * GET /signup : 회원가입 페이지 
    * GET /write : 글작성 페이지 
    * GET /article : 기사 페이지
    * GET /users : 사용자정보 페이지
2.  사용자 
    * POST /lonin : 로그인
    * POST /signup : 회원가입
    * POST /logout : 로그아웃
3. 기사 
   * GET /article : 기사 불러오기
   * POST /article : 기사 업로드
   * PATCH /article : 기사 수정
   * DELETE /article : 기사 삭제
4.  댓글 
    * POST /comment : 댓글 등록
    * DELETE /commet : 댓글 삭제
5.  좋아요
    * POST /like : 좋아요
    * DELETE /like : 좋아요 취소

---

### 데이터베이스 스키마

1. users : 사용자 
2. articles : 기사