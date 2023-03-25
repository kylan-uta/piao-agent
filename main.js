
// const pref = {
//   date: "2023-05-21",
//   title: "【郑州】（521加场）薛之谦“天外来物”巡回演唱会—郑州站",
//   pricePriority: [717, 1017, 1317],
//   visitors: ["贾奇", "罗薇"],
//   payMethod: "微信", 
// };
const pref = {
  date: "2023-07-15",
  title: "【厦门】2023张韶涵「寓言」世界巡回演唱会-厦门站",
  pricePriority: [688, 1088, 588], //["488", "688", "888"],
  visitors: ["贾奇", "罗薇"],
  payMethod: "微信", // "支付宝",
};

auto.waitFor();

let prevState, curState;
let stage1Done, stage2Done, stage3Done;
while (true) {
  transition();
}

function transition() {
  prevState = curState;
  curState = getState();
  if (prevState !== curState) {
    console.log(`${prevState} -> ${curState}`);
  }
  switch (curState) {
    case "stage1":
      if (curState !== prevState) {
        stage1Done = false;
      }
      stage1();
      break;
    case "stage2":
      if (curState !== prevState) {
        stage2Done = false;
      }
      stage2();
      break;
    case "stage3":
      if (curState !== prevState) {
        stage3Done = false;
      }
      stage3();
      break;
    case "loading":
      sleep(5);
      console.log("loading...");
      break;
  }
}

function getState() {
  if (id("project_details_root_layout").findOnce()) {
    return "stage1";
  } else if (id("sku_contanier").findOnce()) {
    // } else if (id("layout_sku").findOnce()) {
    return "stage2";
  } else if (text("确认订单").findOnce()) {
    return "stage3";
    // } else if (id("damai_theme_dialog_layout").findOnce()) {
    //   return "error";
  } else {
    console.log(currentPackage(), currentActivity());
    return "loading";
  }
}

function stage1() {
  if (stage1Done && new Date() - stage1Done < 500) return;

  let title = id("title_layout").findOnce();
  let isThis = title && title.findOne(text(pref.title));
  if (!isThis) return;

  let btn = id("tv_left_main_text").findOnce();
  if (!btn) return;

  stage1Done = new Date();
  btn.parent().click();
  console.log("点击：立即预定");
}

function stage2() {
  if (stage2Done) return;

  let items = id("item_text").textContains(pref.date).findOnce();
  if (!items) return;

  items.parent().parent().parent().parent().click();

  let priceBtn,
    remainEnough = false,
    skuSelection = { seldOut: [], select: null };

  for (let curPrice of pref.pricePriority) {
    priceBtn = id("item_text").textContains(`${curPrice}元`).findOnce();
    if (!priceBtn) continue;

    priceBtn = priceBtn.parent();
    if (priceBtn.findOne(textContains("缺货"))) {
      skuSelection.seldOut.push(curPrice);
    } else {
      skuSelection.select = curPrice;
      priceBtn.parent().parent().parent().click();
      // 调整人数
      let addBtn = id("img_jia").findOnce();
      if (!addBtn) return;
      for (let t in pref.visitors) {
        if (t > 0) addBtn.click();
      }
      let numDiv = id("tv_num").findOnce();
      if (!numDiv) return;
      if (
        parseInt(numDiv.text().match(/([0-9]+)张/)[1]) === pref.visitors.length
      ) {
        remainEnough = true;
      }
      break;
    }
  }

  if (!remainEnough) {
    toast("余票不足");
    stage2Done = true;
    back();
  } else {
    toast(
      `已选:${skuSelection.select}${
        skuSelection.seldOut.length
          ? `,售空:${skuSelection.seldOut.join(",")}`
          : ""
      }`
    );
    let buy = id("btn_buy").findOnce();
    if (!buy) return;
    stage2Done = true;
    buy.click();
  }
}

function stage3() {
  if (stage3Done) return;

  // 选观演人
  let visitors = id("text_name").find();
  if (!visitors || visitors.empty()) return;

  visitors.forEach((e) => {
    if (pref.visitors.includes(e.text())) {
      let check = e.parent();
      if (!check) return;
      check = check.findOne(checkable());
      if (!check) return;
      if (!check.checked()) check.click();
    }
  });

  // 下滑，选择支付方式
  let scroll = id("recycler_view").findOnce();
  if (!scroll) return;
  scroll.scrollForward();

  let paymethod = id("tv_pay_title").text(pref.payMethod).findOnce();
  if (!paymethod) return;
  paymethod = paymethod.parent().parent();
  if (!paymethod) return;
  let cb = paymethod.children()[2];
  let btn = paymethod.parent();
  if (!cb || !btn) return;
  if (!cb.checked()) {
    btn.click();
    return;
  }

  let submit = text("提交订单").clickable().findOne();
  if (!submit) return;
  stage3Done = true;
  submit.click();
}

// function orderNow() {
//   let curAct = currentActivity();
//   console.log("current activity:", curAct);
//   stage1();
//   // switch (curAct) {
//   //   case "cn.damai.trade.newtradeorder.ui.projectdetail.ui.activity.ProjectDetailActivity":
//   //     if (!stage1()) return;
//   //     break;
//   // }

//   // 点击后可能出现：
//   // 1。activity不变，排队的人数太多啦，努力刷新按钮，点努力刷新停留在原界面
//   // 2. activity变化，同一时间下单人数过多，需要按返回

//   // “场次”按钮
//   id("item_text")
//     .textContains(pref.date)
//     .findOne()
//     .parent()
//     .parent()
//     .parent()
//     .parent()
//     .click();

//   let priceBtn, remainEnough;
//   let skuSelection = { seldOut: [], select: null };
//   for (let curPrice of pref.pricePriority) {
//     priceBtn = id("item_text").textContains(`${curPrice}元`).findOne().parent();
//     if (priceBtn.findOne(textContains("缺货"))) {
//       skuSelection.seldOut.push(curPrice);
//       remainEnough = false;
//     } else {
//       skuSelection.select = curPrice;
//       priceBtn.parent().parent().parent().click();
//       // 调整人数
//       // 可能票数不够
//       const addBtn = id("img_jia").findOne();
//       for (let t in pref.visitors) {
//         if (t > 0) {
//           addBtn.click();
//         }
//         // const numElem = id("tv_num").findOne();
//         // const numText = numElem.text();
//         // num = parseInt(numText.match(/([0-9]+)张/)[1]);
//         // console.log(num);
//       }
//       break;
//     }
//   }

//   toast(
//     `${skuSelection.select ? `已选:${skuSelection.select}` : ""}${
//       skuSelection.seldOut.length
//         ? `${skuSelection.select ? "," : ""}售空:${skuSelection.seldOut.join(
//             ","
//           )}`
//         : ""
//     }`
//   );

//   if (priceBtn) {
//     id("btn_buy").findOne().click();

//     // 选观演人
//     id("text_name")
//       .untilFind()
//       .forEach((e) => {
//         if (pref.visitors.includes(e.text())) {
//           e.parent().findOne(checkable()).click();
//         }
//       });

//     // 下滑，选择支付方式
//     id("recycler_view").scrollForward();
//     id("tv_pay_title")
//       .text(pref.payMethod)
//       .findOne()
//       .parent()
//       .parent()
//       .parent()
//       .click();

//     text("提交订单").clickable().findOne().click();

//     // 可能出现：库存不足、同一时间下单人数过多
//     if (currentActivity() !== "cn.damai.ultron.view.activity.DmOrderActivity")
//       desc("立即支付").clickable().findOne().click();
//     return;
//   } else {
//     back();
//   }
// }
