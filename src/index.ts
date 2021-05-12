import * as PIXI from "pixi.js";
// webpack error on PixiJS v5. import { loader } from "webpack";
import { Asset, WebpackPluginInstance as loader } from "webpack";
// window.PIXI = PIXI;
import { STAGES, ASSETS, GAMES } from "./constants";
import { setText } from "./helper/setText";
import { randomInt } from "./helper/randomInt";
import Stats from "stats.js";
import { Howl, Howler } from "howler"; // npm install --save @types/howler
import { gsap } from "gsap"; // npm install -D @types/gsap

import { PixiPlugin } from "gsap/PixiPlugin";
import {
  AnimatedSprite,
  DisplayObject,
  InteractionEvent,
  Sprite,
} from "pixi.js";
import { shuffle } from "gsap/all";

// register the plugin
gsap.registerPlugin(PixiPlugin);
// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

console.log(PIXI);

// stats
let stats: Stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// constant
const WIDTH: number = STAGES.WIDTH;
const HEIGHT: number = STAGES.HEIGHT;
const BG_COLOR: number = STAGES.BG_COLOR;

const CARD_CLOSED: number = 0;
const CARD_OPEN: number = 1;
const CARD_COMPLETED: number = 2;

// renderer
const renderer: PIXI.Renderer = new PIXI.Renderer({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: BG_COLOR,
});
document.body.appendChild(renderer.view);

// stage
const stage: PIXI.Container = new PIXI.Container();

// Custom GameLoop(v5), call requestAnimationFrame directly.
let oldTime: number = Date.now();
let ms: number = 1000;
let fps: number = GAMES.FPS;
let animate: FrameRequestCallback = (): void => {
  // console.log("animate()");
  let newTime: number = Date.now();
  let deltaTime: number = newTime - oldTime;
  oldTime = newTime;
  deltaTime < 0 ? (deltaTime = 0) : deltaTime;
  deltaTime > ms ? (deltaTime = ms) : deltaTime;
  renderer.render(stage);
  stats.begin();
  requestAnimationFrame(animate);

  // GameLoop
  if (gameLoopFlag) {
    gameLoop(deltaTime);
  }

  stats.end();
};

// init

// loader
let loader: PIXI.Loader = new PIXI.Loader();

// container
let container: PIXI.Container = new PIXI.Container(); // Main
container.width = WIDTH;
container.height = HEIGHT;
container.x = 0;
container.y = 0;
container.pivot.x = 0.5;
container.pivot.y = 0.5;
container.interactive = false;
container.interactiveChildren = true;
container.buttonMode = false;
stage.addChild(container);

let gameClearScene: PIXI.Container = new PIXI.Container();

// Graphic
let buttonOffRect: PIXI.Graphics = new PIXI.Graphics(); // button off cover
buttonOffRect.lineStyle(1, 0xff0033, 1); // width, color, alpha
buttonOffRect.beginFill(0xff0033);
buttonOffRect.drawRect(0, 0, WIDTH, HEIGHT);
buttonOffRect.endFill();
buttonOffRect.alpha = 0;
buttonOffRect.visible = false;
buttonOffRect.interactive = true;
buttonOffRect.interactiveChildren = false;
buttonOffRect.buttonMode = false;

let rectangles: PIXI.Graphics[] = []; // card hit area

// sprite
let bg: PIXI.Sprite;
let pic_gametitle: PIXI.Sprite;
let cards_back: PIXI.Sprite[] = [];
let cards1st: PIXI.Sprite[] = [];
let cards2nd: PIXI.Sprite[] = [];

let pic_hole: PIXI.Sprite;
let pic_cat: PIXI.Sprite;
let pic_x: PIXI.Sprite;

// animation sprite
let cardShine1: PIXI.AnimatedSprite;
let cardShine2: PIXI.AnimatedSprite;

// text
let text_pixiVersion: PIXI.Text;
let text_gameclear: PIXI.Text;
let text_loading: PIXI.Text;

// flag
let gameLoopFlag: boolean = false;

// resources
let gameResources: any;

// sound
let cardOpenSound: Howl;

if (ASSETS.ASSET_BG === "") {
  console.log("Don't use background image.");
} else {
  loader.add("bg_data", ASSETS.ASSET_BG);
}
loader.add("obj_1_data", ASSETS.ASSET_OBJ1);
loader.add("obj_2_data", ASSETS.ASSET_OBJ2);
loader.add("obj_3_data", ASSETS.ASSET_OBJ3);
loader.add("obj_4_data", ASSETS.ASSET_OBJ4);
loader.add("obj_5_data", ASSETS.ASSET_OBJ5);
loader.add("obj_6_data", ASSETS.ASSET_OBJ6);
loader.add("obj_7_data", ASSETS.ASSET_OBJ7);

loader.add("obj_8_data", ASSETS.ASSET_OBJ8);
loader.add("obj_9_data", ASSETS.ASSET_OBJ9);
loader.add("obj_10_data", ASSETS.ASSET_OBJ10);

loader.load((loader: PIXI.Loader, resources: any) => {
  console.log(loader);
  console.log(resources);
  gameResources = resources;

  gameSetup();
});

// err
loader.onError.add(() => {
  throw Error("load error ...");
});

// text loading
text_loading = setText(
  "Loading asset data ....",
  "Arial",
  20,
  0x333333,
  "left",
  "normal"
);
container.addChild(text_loading);
text_loading.x = 10;
text_loading.y = 10;

/**
 * EnterFrame
 * @param delta
 */
const gameLoop = (delta: number): void => {
  // console.log("gameLoop()", delta);
};

/**
 * Setup game data
 * @param resources
 */
const gameSetup = (): void => {
  console.log("gameSetup()");

  container.removeChild(text_loading);

  // main class
  const cardgame: CardGame = new CardGame();
  cardgame.init();

  // app start
  gameLoopFlag = true;
  requestAnimationFrame(animate); // -> gameLoop start
};

/**
 * Memory Game Main Class
 */
class CardGame {
  public cardMaxNum: number = 12; // Maximum number of cards
  public cardPicMaxNum: number = 7; // Maximum number of card symbols

  public offsetX: number = 100; // Start arranging cards x point
  public offsetY: number = 110; // Start arranging cards y point
  public cardCols: number = 4; // Number of cards arranged side by side (row)
  public cardRows: number = 3; // Number of cards arranged vertically (column)
  public cardWidth: number = 92;
  public cardHeight: number = 135;
  public cardOffset: number = 10;

  public count: number = 0; // Number of opened cards
  public openCard: [number, number] = [100, 100]; // two card, that now opened
  public stat: number[] = []; // State of all cards (0: back、1: now opened、2: open）

  public card: number[] = []; // Enter the number of the picture on the card

  public isSameCard1st: boolean[] = []; // drawing the first card with the same pattern
  public cardAll: PIXI.Sprite[] = []; // 1st and 2nd cards stored in sequence
  public openCardSprite: PIXI.Sprite[] = []; // Sprite images of the 1st and 2nd open cards

  public selectNum1st: number = -1; // First opened card number

  public rect1st: any = null; // hitarea of the 1st selected card
  public rect2nd: any = null; // hitarea of the 2nd selected card

  public leftNum: number = this.cardMaxNum; // Number of remaining cards, 0 = gameclear

  public mouseEnabled: boolean = true;

  /**
   * Initialize the card order.
   */
  public init(): void {
    console.log("init()");

    // sprite

    // bg
    if (ASSETS.ASSET_BG !== "") {
      bg = new PIXI.Sprite(gameResources.bg_data.texture);
      container.addChild(bg);
    }

    // hole
    pic_hole = new PIXI.Sprite(gameResources.obj_8_data.texture);
    pic_hole.scale.x = 0.75;
    pic_hole.scale.y = 0.75;
    pic_hole.x = WIDTH / 2 - pic_hole.width / 2;
    pic_hole.y = 550;
    container.addChild(pic_hole);

    // cat
    pic_cat = new PIXI.Sprite(gameResources.obj_9_data.texture);
    pic_cat.scale.x = 0.75;
    pic_cat.scale.y = 0.75;
    pic_cat.x = WIDTH / 2 - pic_cat.width / 2 + 110;
    pic_cat.y = 550;
    container.addChild(pic_cat);

    // x
    pic_x = new PIXI.Sprite(gameResources.obj_10_data.texture);
    pic_x.scale.x = 0.75;
    pic_x.scale.y = 0.75;
    pic_x.x = WIDTH / 2 - pic_x.width / 2 + 220;
    pic_x.y = 550;
    container.addChild(pic_x);

    // title
    pic_gametitle = new PIXI.Sprite(gameResources.obj_2_data.texture);
    pic_gametitle.scale.x = 0.75;
    pic_gametitle.scale.y = 0.75;
    pic_gametitle.x = WIDTH / 2 - pic_gametitle.width / 2;
    pic_gametitle.y = 20;
    container.addChild(pic_gametitle);

    container.addChild(gameClearScene);
    gameClearScene.visible = false;

    // text pixi version
    let version: string = `PixiJS: ver.${PIXI.VERSION}`;
    text_pixiVersion = setText(
      version,
      "Arial",
      16,
      0xf0fff0,
      "left",
      "normal"
    );
    container.addChild(text_pixiVersion);
    text_pixiVersion.x = WIDTH - text_pixiVersion.width - 10;
    text_pixiVersion.y = HEIGHT - text_pixiVersion.height - 5;

    // text game clear
    text_gameclear = setText(
      "Game Clear!",
      "Arial",
      64,
      0xf0fff0,
      "left",
      "normal"
    );
    text_gameclear.x = WIDTH / 2;
    text_gameclear.y = HEIGHT / 2;
    text_gameclear.anchor.set(0.5, 0.5);
    text_gameclear.scale.x = 0.5;
    text_gameclear.scale.y = 0.5;
    text_gameclear.alpha = 1; // TODO: tween
    gameClearScene.addChild(text_gameclear);

    // Set sprite sheet(texture atras frame)
    let id: any = gameResources.obj_1_data.textures;
    let scaleNum: number = 0.5;

    // Register the sprite of the card design(1/2)
    for (let i: number = 0; i < this.cardPicMaxNum; i++) {
      cards1st[i] = new PIXI.Sprite(id[`pic_trumpx2_${i}.png`]);
      cards1st[i].scale.x = cards1st[i].scale.y = scaleNum;
      cards1st[i].x = -1000;
      cards1st[i].y = -1000;
      container.addChild(cards1st[i]);
      cards1st[i].name = `cards1st_${i}`;
    }

    // Register the sprite of the card design(2/2).
    for (let j: number = 0; j < this.cardPicMaxNum; j++) {
      cards2nd[j] = new PIXI.Sprite(id[`pic_trumpx2_${j}.png`]);
      cards2nd[j].scale.x = cards2nd[j].scale.y = scaleNum;
      cards2nd[j].x = -1000;
      cards2nd[j].y = -1000;
      container.addChild(cards2nd[j]);
      cards2nd[j].name = `cards2nd_${j}`;
    }

    // Create sprites for the background image of the cards.
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      cards_back[i] = new PIXI.Sprite(id["pic_trumpx2_cover.png"]);
      cards_back[i].scale.x = cards_back[i].scale.y = scaleNum;
      cards_back[i].x = -1000;
      cards_back[i].y = -1000;
      container.addChild(cards_back[i]);
      cards_back[i].name = `cards_back_${i}`;
    }

    // hit area for click, tap
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      rectangles[i] = new PIXI.Graphics();
      rectangles[i].lineStyle(1, 0xff3300, 0); // width, color, alpha
      rectangles[i].beginFill(0x66ccff);
      rectangles[i].drawRect(0, 0, this.cardWidth, this.cardHeight);
      rectangles[i].endFill();
      rectangles[i].x =
        this.offsetX + (i % this.cardCols) * (this.cardWidth + this.cardOffset);
      rectangles[i].y =
        this.offsetY +
        (i % this.cardRows) * (this.cardHeight + this.cardOffset);
      //rectangles[i].x = 30 + i * 50 + 10;
      container.addChild(rectangles[i]);

      rectangles[i].interactive = true;
      rectangles[i].buttonMode = true;
      rectangles[i].interactiveChildren = true;
      rectangles[i].name = `rectangle_${i}`;

      // rectangle.visible = false; // Hit judgment disappears when using visible=false.
      rectangles[i].alpha = 0.0; // If alpha=0, hit judgment is valid.

      rectangles[i].on("tap", (e: InteractionEvent) => {
        if (this.mouseEnabled) {
          console.log("rectangle tap!", e.target.name);
          this.onClickTap(e);
        }
      });
      rectangles[i].on("click", (e: InteractionEvent) => {
        if (this.mouseEnabled) {
          console.log("rectangle click!", e.target.name);
          this.onClickTap(e);
        }
      });
    }

    // Create Animated sprite
    let cardShineImages: string[] = [
      "assets/images/pic_light_1.png",
      "assets/images/pic_light_1.png",
      "assets/images/pic_light_2.png",
      "assets/images/pic_light_3.png",
      "assets/images/pic_light_4.png",
    ];
    let textureArray: PIXI.Texture[] = [];
    for (let i: number = 0; i < 5; i++) {
      let texture: PIXI.Texture = PIXI.Texture.from(cardShineImages[i]);
      textureArray.push(texture);
    }

    cardShine1 = new PIXI.AnimatedSprite(textureArray);
    cardShine1.x = -1000;
    cardShine1.y = -1000;
    cardShine1.scale.set(0.5);
    cardShine1.animationSpeed = 0.2;
    cardShine1.loop = false;
    cardShine1.alpha = 0.75;
    cardShine1.play();
    cardShine1.onComplete = () => {
      // console.log("cardShine1 anim.totalFrames: ", cardShine1.totalFrames);
      // console.log("cardShine1 animation end");
      cardShine1.visible = false;
    };
    container.addChild(cardShine1);

    cardShine2 = new PIXI.AnimatedSprite(textureArray);
    cardShine2.x = -1000;
    cardShine2.y = -1000;
    cardShine2.scale.set(0.5);
    cardShine2.animationSpeed = 0.2;
    cardShine2.loop = false;
    cardShine2.alpha = 0.75;
    cardShine2.play();
    cardShine2.onComplete = () => {
      // console.log("cardShine2 anim.totalFrames: ", cardShine2.totalFrames);
      // console.log("cardShine2 animation end");
      cardShine2.visible = false;
    };
    container.addChild(cardShine2);

    // SE
    cardOpenSound = new Howl({
      src: [gameResources.obj_7_data.url],
      autoplay: false,
      loop: false,
      volume: 0.1,
      onend: () => {
        // console.log("cardOpenSound finished.");
      },
    });

    // set card state
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      this.stat[i] = 0;
      this.isSameCard1st[i] = false;
    }
    console.log(`this.stat: ${this.stat}`);

    this.shuffle();
  }

  /**
   * Shuffle the card
   */
  public shuffle(): void {
    console.log("shuffle()");
    this.count = 0;
    this.stat.map((idx) => {
      this.stat[idx] = 0;
    });

    let notUseCard: number = randomInt(0, this.cardPicMaxNum - 1);
    console.log(`notUseCard: ${notUseCard}`);

    // Set the card design number in the card number
    let k: number = 0;
    for (let i: number = 0; i < 7; i++) {
      if (i !== notUseCard) {
        // Set with 2 pairs
        this.card[k] = i;
        this.card[k + 1] = i;
        k = k + 2;
      }
    }
    console.log(`this.card(After deleting a set of pictures): ${this.card}`); // ex. this.card: 0,0,1,1,2,2,3,3,5,5,6,6

    // Sort the card
    for (let j: number = 0; j < this.cardMaxNum; j++) {
      let rndNum: number = randomInt(0, this.cardMaxNum - 1);
      // console.log(rndNum);
      let tempNum: number = this.card[j];
      this.card[j] = this.card[rndNum];
      this.card[rndNum] = tempNum;
    }
    console.log(`this.card(After sorting): ${this.card}`); // ex. this.card: 5,3,6,1,0,4,5,1,3,6,4,0

    this.displayCard();
  }

  /**
   * Display the card
   */
  public displayCard(): void {
    console.log("displayCard()");

    for (let i: number = 0; i < this.cardMaxNum; i++) {
      // set a card on the back
      cards_back[i].x =
        this.offsetX + (i % this.cardCols) * (this.cardWidth + this.cardOffset);
      cards_back[i].y =
        this.offsetY +
        (i % this.cardRows) * (this.cardHeight + this.cardOffset);

      // set a card on the open
      if (this.isSameCard1st[this.card[i]] === false) {
        this.isSameCard1st[this.card[i]] = true;
        console.log("Display the card image of the 1st card of the pair");
        cards1st[this.card[i]].x =
          this.offsetX +
          (i % this.cardCols) * (this.cardWidth + this.cardOffset);
        cards1st[this.card[i]].y =
          this.offsetY +
          (i % this.cardRows) * (this.cardHeight + this.cardOffset);
        this.cardAll.push(cards1st[this.card[i]]);
      } else {
        console.log("Display the card image of the 2nd card of the pair");
        cards2nd[this.card[i]].x =
          this.offsetX +
          (i % this.cardCols) * (this.cardWidth + this.cardOffset);
        cards2nd[this.card[i]].y =
          this.offsetY +
          (i % this.cardRows) * (this.cardHeight + this.cardOffset);
        this.cardAll.push(cards2nd[this.card[i]]);
      }
    }
    console.log("this.cardAll: ", this.cardAll);
  }

  /**
   * CallBack when a card is clicked or tapped
   * @param e
   */
  public async onClickTap(e: InteractionEvent) {
    console.log("onClickTap() ", e.target.name);

    // se
    cardOpenSound.stop();
    cardOpenSound.play();

    this.mouseEnabled = false;
    console.log("stat: ", this.stat);

    console.log("The card to be opened this time");
    let tempStr: string = String(e.target.name);
    let selectNum: number = Number(tempStr.substr(10));
    console.log("selectNum: ", selectNum);

    if (this.count === 0) {
      console.log("open the 1st card");
      this.rect1st = e.target;
      this.rect1st.visible = false;

      for (let i: number = 0; i < this.cardMaxNum; i++) {
        if (this.stat[i] === CARD_OPEN) {
          this.stat[i] = CARD_CLOSED;
        }
      }

      this.openCardSprite = [];
      this.openCard[0] = -1;
      this.openCard[1] = -1;
      this.selectNum1st = 1;

      if (this.stat[selectNum] === CARD_CLOSED) {
        this.stat[selectNum] = CARD_OPEN;
        cards_back[selectNum].visible = false;
        this.openCard[0] = this.card[selectNum];
        this.openCardSprite[0] = this.cardAll[selectNum];
        console.log("this.openCard[0]: ", this.openCard[0]);
        console.log("this.openCard[this.count]; ", this.openCard[this.count]);
        console.log("this.openCardSprite[0]: ", this.openCardSprite[0].name);
      }
      console.log(`stat(after 1st select]: ${this.stat}`);
      this.selectNum1st = selectNum;
    } else if (this.count === 1) {
      console.log("open the 2nd card");

      // buttonMode off
      container.addChild(buttonOffRect);
      buttonOffRect.visible = true;

      this.rect2nd = e.target;
      this.rect2nd.visible = false;

      this.stat[selectNum] = CARD_OPEN;
      cards_back[selectNum].visible = false;

      this.openCard[1] = this.card[selectNum];
      this.openCardSprite[1] = this.cardAll[selectNum];
      console.log("this.openCard[1]: ", this.openCard[1]);
      console.log("this.openCard[this.count]", this.openCard[this.count]);
      console.log("this.openCardSprite[1]: ", this.openCardSprite[1].name);

      console.log(
        `selectcard 1st and 2nd: ${this.openCard[0]}, ${this.openCard[1]}`
      );

      if (this.openCard[0] === this.openCard[1]) {
        console.log("Pictures is match, fix the card status CARD_COMPLETED");
        this.stat[this.selectNum1st] = CARD_COMPLETED;
        this.stat[selectNum] = CARD_COMPLETED;
        console.log("1st card: ", this.openCardSprite[0].name);
        console.log("2ndcard: ", this.openCardSprite[1].name);

        // shine the card
        await this.sleep(300);
        cardShine1.x = this.openCardSprite[0].x;
        cardShine1.y = this.openCardSprite[0].y;
        cardShine1.visible = true;
        cardShine1.gotoAndStop(1);
        cardShine1.play();

        cardShine2.x = this.openCardSprite[1].x;
        cardShine2.y = this.openCardSprite[1].y;
        cardShine2.visible = true;
        cardShine2.gotoAndStop(1);
        cardShine2.play();

        // Wait a moment and then move to the bottom left
        await this.sleep(1200);
        this.openCardSprite[0].x = 100 + (this.cardMaxNum - this.leftNum) * 5;
        this.openCardSprite[0].y = 550;
        this.openCardSprite[1].x = 110 + (this.cardMaxNum - this.leftNum) * 5;
        this.openCardSprite[1].y = 550;
        container.addChild(this.openCardSprite[0]);
        container.addChild(this.openCardSprite[1]);
        this.leftNum -= 2;
        console.log(`this.leftNum: ${this.leftNum}`);

        container.removeChild(buttonOffRect);
        if (this.leftNum === 0) {
          this.clearGame();
        }
      } else {
        console.log("Pictures do not match, so restore them");
        await this.sleep(1200);
        this.rect1st.visible = true;
        this.rect2nd.visible = true;
        cards_back[this.selectNum1st].visible = true;
        cards_back[selectNum].visible = true;
        container.removeChild(buttonOffRect);
      }
      console.log(`stat(after 2nd select]: ${this.stat}`);
      console.log("\n");
    }

    // reset
    this.count = this.count + 1;
    if (this.count === 2) {
      this.count = 0;
      this.rect1st = null;
      this.rect2nd = null;
    }

    this.mouseEnabled = true;
  }

  /**
   * Clear the game
   */
  private clearGame(): void {
    console.log("clearGame()");
    this.mouseEnabled = false;
    gameClearScene.visible = true;
  }

  /**
   * Wait a minute
   * @param ms millisecond
   * @returns
   */
  private sleep(ms: number) {
    // console.log("clearGame()", ms);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
