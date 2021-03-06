강의노트
====

#### npm init
지정한 디렉토리의 프로젝트(폴더)를 패키지로 지정하기 위한 여러가지 환경설정. (package.json)

    "dependencies": {
        "underscore": "^1.9.1"
    }

### dependencies
의존성 명시(모듈 설치할때 **--save를 해야 명시됨**)만 있으면 **npm install**시 모듈들이 다 설치됨

**언제 포함을 안시키냐**: 일시적으로 사용하는 것들. (**--save 빼고 설치**)
**프로젝트에 반드시 필요하거나 같이 다녀야 하는 것**들은 **--save**를 붙여서 의존성 안에 항목으로 표함

### 동기(Sync) & 비동기(Async)
동기식 방식 : 각 작업이 완료 될 때까지 대기 한 후 다음 작업을 실행합니다.

비동기 방식 : 각 작업이 완료 될 때까지 기다리지 않고 첫 번째 GO에서 모든 작업을 실행합니다.

#### 자바스크립트의 비동기 처리
특정 코드의 연산이 끝날 때까지 코드의 실행을 멈추지 않고
다음 코드를 먼저 실행하는 자바스크립트의 특성을 의미합니다.<br><br>
<img src="https://t1.daumcdn.net/cfile/tistory/9910DB475ACD72AE33">
<br><br>
**동기(sync)** 라면

1. Hello
2. Bye (Bye가 실행될때까지 Hello Again은 실행되지 않는다.)
3. Hello Again

자바스크립트는 기본적으로 **비동기(async)** 이기 때문에

1. Hello
2. Hello Again
3. Bye

의 순으로 실행되는 것.


### app.js
- 메인파일, 엔트리(진입)파일, 메인애플리케이션 이라고 부른다.
- 어떤 프로젝트의 진입 파일. 애플리케이션 최초의 진입점.

### get
- **라우터**라 부른다.
- get이 하는 일을 **라우팅**이라 한다.