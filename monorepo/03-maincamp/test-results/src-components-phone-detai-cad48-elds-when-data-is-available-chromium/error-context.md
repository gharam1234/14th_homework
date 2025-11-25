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
  - generic [ref=e16]:
    - button "← Previous" [ref=e17] [cursor=pointer]
    - generic [ref=e19]:
      - img [ref=e23]
      - img "배너1" [ref=e27]
      - img [ref=e31]
      - img [ref=e35]
      - img [ref=e39]
    - button "→ Next" [ref=e40] [cursor=pointer]
    - list [ref=e41]:
      - listitem [ref=e42] [cursor=pointer]:
        - button "• 1" [ref=e43]
      - listitem [ref=e44] [cursor=pointer]:
        - button "• 2" [ref=e45]
      - listitem [ref=e46] [cursor=pointer]:
        - button "• 3" [ref=e47]
  - generic [ref=e50]:
    - heading "404" [level=1] [ref=e51]
    - heading "This page could not be found." [level=2] [ref=e53]
```