# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - list [ref=e6]:
      - listitem [ref=e7]: 트립토크
      - listitem [ref=e8]: 숙박권 구매
      - listitem [ref=e9]: 마이 페이지
    - button "로그인 right" [ref=e11] [cursor=pointer]:
      - text: 로그인
      - img "right" [ref=e12]:
        - img [ref=e13]
  - generic [ref=e18]:
    - generic [ref=e19]:
      - generic [ref=e20]:
        - img "logo" [ref=e21]
        - heading "트립트립에 오신 것을 환영합니다." [level=1] [ref=e22]
      - generic [ref=e23]:
        - heading "트립트립에 로그인 하세요" [level=2] [ref=e24]
        - textbox "이메일을 입력해 주세요" [ref=e25]
        - textbox "비밀번호를 입력해주세요" [ref=e26]
    - generic [ref=e27]:
      - button "로그인" [ref=e28] [cursor=pointer]
      - button "회원가입" [ref=e29] [cursor=pointer]
```