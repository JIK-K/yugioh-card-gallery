# Yu-Gi-Oh! Card Gallery

유희왕 카드 갤러리 웹 프로젝트입니다. 부스터 팩별로 카드를 탐색하고, 레어도에 따라 다른 홀로그래픽·포일 효과를 적용한 카드 이미지를 감상할 수 있습니다.  
[YUGIOH CARD GALLERY](https://jik-k.github.io/yugioh-card-gallery/) 해당 링크로 접속하여 카드들을 구경할 수 있습니다.

---

## 프로젝트 소개

이 프로젝트는 **Yu-Gi-Oh! TCG** 부스터 팩에 수록된 카드들을 한곳에서 구경할 수 있는 갤러리입니다.

- **부스터 팩 선택**: 사이드바에서 팩을 선택하면 해당 팩의 카드 목록이 로드됩니다.
- **레어도별 시각 효과**: Common, Rare, Super Rare, Ultra Rare, Secret Rare 등 레어도에 따라 서로 다른 빛·반사·포일 효과가 적용됩니다.
- **3D 틸트 + 홀로그래픽**: 마우스를 카드 위에 올리면 카드가 기울어지고, 포인터 위치에 따라 빛/반사가 움직이는 인터랙티브 효과가 적용됩니다.
- **카드 정보 팝오버**: 카드에 마우스를 올리면 카드 ID, 이름, 타입, 레어도가 팝오버로 표시됩니다.

카드 스타일은 [pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css)를 레퍼런스로 하였고, 카드 이미지는 [YGOPRODECK](https://ygoprodeck.com/card-database/?num=24&offset=0)를 통해 제공되며, 팩별 데이터는 로컬 JSON 파일(`data/*.json`)로 관리됩니다.

![Alt Text](./img/demo.gif)

### 기술 스택

- HTML, CSS, JavaScript
- 카드 이미지: [YGOPRODECK](https://ygoprodeck.com/api-guide/)
- 레퍼런스: [pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css)
- 데이터: 로컬 JSON (`data/*.json`)

---

## 프로젝트 구조

```
├── index.html          # 메인 페이지 (카드 렌더 + JS로 CSS 변수 제어)
├── fetch_pack.py       # 부스터 팩 데이터 다운로드
├── data/               # 팩별 카드 JSON
├── css/
│   ├── layout.css      # 레이아웃, 사이드바, 그리드
│   ├── index.css       # card.css + 레어도 CSS import
│   ├── card.css        # 카드 공통 구조, CSS 변수, 3D 틸트, shine/glare 레이어, 팝오버
│   └── rarity-*.css    # 레어도별 shine/glare 스타일 (common, rare, super-rare, ultra-rare, secret-rare)
└── img/                # favicon, glitter.png, illusion.png, trainerbg.png 등
```

## 구현 방식

카드가 레어도마다 다르게 반짝이는 이유는, **카드 위에 투명한 레이어를 여러 장 겹쳐 놓고**  
그 레이어의 `gradient`·`blend-mode`·`filter`를 마우스 위치에 맞춰 움직이도록 했기 때문입니다.

### 1. 마우스 → CSS 변수

`index.html` 안의 스크립트는 카드 위에서 마우스를 움직일 때마다 다음 값을 실시간으로 계산해서  
각 카드의 루트(`.card-item`)에 **CSS 변수**로 넘깁니다.

- `--pointer-x`, `--pointer-y` : 카드 안에서 마우스가 있는 위치 (0~100%, x/y)
- `--background-x`, `--background-y` : shine/glare 배경 패턴이 따라갈 기준 위치
- `--pointer-from-center` : 카드 정중앙에서 마우스까지의 거리 (0~1). 멀어질수록 빛이 강해지거나 약해질 때 사용
- `--rot-x`, `--rot-y` : 카드가 기울어지는 각도 (3D 틸트)
- `--card-opacity` : 호버 시 1, 마우스를 떼면 0. 레이어가 켜졌다 꺼졌다 하는 정도

레어도 CSS에서는 이 값을 그대로 가져다 써서 `radial-gradient(... at var(--pointer-x) var(--pointer-y))` 위치,  
`background-position`, `opacity`, `filter`(brightness/contrast/saturate) 등을 바꾸고,  
그래서 **마우스를 움직이면 레이어 안의 무늬와 빛이 따라오는 것처럼** 보입니다.

### 2. 카드 한 장의 레이어 구조

눈에 보이지 않게, 카드 위에는 이런 순서로 레이어가 쌓여 있습니다.

1. **카드 이미지 (`.card-3d img`)**  
   - 실제 유희왕 카드 그림이 그려진 가장 아래 레이어입니다.  
   - `.card-3d`에 `transform: rotateX(var(--rot-x)) rotateY(var(--rot-y))`가 걸려서, 카드 전체가 기울어집니다.
2. **shine 레이어 (`.card-shine`)**  
   - 카드 전체를 덮는 투명 비닐 같은 레이어입니다.  
   - 이 안에 **여러 개의 gradient / 포일 이미지 / 무지개 띠**가 겹겹이 들어 있고,  
     `mix-blend-mode`, `background-blend-mode`로 카드 이미지 위에 섞이면서 “포일 느낌”을 냅니다.
3. **glare 레이어 (`.card-glare`)**  
   - 강한 스포트라이트처럼, 마우스 위치를 기준으로 둥근 빛이 생기는 레이어입니다.  
   - `radial-gradient(... at var(--pointer-x) var(--pointer-y))`로, 마우스를 따라다니는 흰색/회색 하이라이트를 그립니다.

`card.css`는 이 세 레이어의 **위치와 기본 형태만** 정의해 두고,  
**“각 레어도에서 어떤 무늬와 색을 얹을지”는 전부 레어도별 CSS에서 채우는 구조**입니다.

### 3. 레어도별 CSS (rarity-*.css)

각 레어도는 `[data-rarity="Rare"]` 같은 **속성 선택자**로 구분됩니다.  
그리고 그 안에서 `.card-shine`, `.card-shine::before`, `.card-shine::after`, `.card-glare`까지 **또 레이어를 쌓아서** 효과를 만듭니다.

- **Common / Short Print (`rarity-common.css`)**  
- **Rare (`rarity-rare.css`)**  
- **Super Rare (`rarity-super-rare.css`)**  
- **Ultra Rare (`rarity-ultra-rare.css`)**  
- **Secret Rare (`rarity-secret-rare.css`)**  

모두 `var(--pointer-x)`, `var(--pointer-y)`, `var(--card-opacity)`, `var(--pointer-from-center)` 등을 써서
마우스 위치와 거리에 따라 각 레이어의 밝기, 색, 위치가 계속 변하게 만든다는 점입니다.  
JavaScript는 카드 위에서 마우스가 어디 있는지만 알려주고,  
실제 반짝임·포일·무지개는 전부 CSS 레이어를 겹쳐서 만든 효과입니다.

---

