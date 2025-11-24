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
  - generic [ref=e17]:
    - heading "404" [level=1] [ref=e18]
    - heading "This page could not be found." [level=2] [ref=e20]
```