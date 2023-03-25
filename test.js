// const pref = {
//   date: "2023-05-20",
//   pricePriority: [717, 1017, 1317], //["488", "688", "888"],
//   visitors: ["贾奇", "罗薇"],
//   payMethod: "微信", // "支付宝",
// };
const pref = {
  date: "2023-07-15",
  pricePriority: [688, 1088, 488, 388], //["488", "688", "888"],
  visitors: ["贾奇", "罗薇"],
  payMethod: "微信", // "支付宝",
};

auto.waitFor();

function orderNow() {
  
}

let toastDict;
for (let times = 0; times < 10; times++) {
  if (times === 1) pref.pricePriority.push(888);
  // “立即购买”按钮
  id("tv_left_main_text").findOne().parent().click();

  sleep(200);
  if (
    currentActivity() ===
    "cn.damai.trade.newtradeorder.ui.projectdetail.ui.activity.ProjectDetailActivity"
  ) {

  };

  // 点击后可能出现：
  // 1。activity不变，排队的人数太多啦，努力刷新按钮，点努力刷新停留在原界面
  // 2. activity变化，同一时间下单人数过多，需要按返回

  // “场次”按钮
  id("item_text")
    .textContains(pref.date)
    .findOne()
    .parent()
    .parent()
    .parent()
    .parent()
    .click();

  let priceBtn, remainEnough;
  toastDict = { seldOut: [], select: null };
  for (let curPrice of pref.pricePriority) {
    priceBtn = id("item_text").textContains(`${curPrice}元`).findOne().parent();
    if (priceBtn.findOne(textContains("缺货"))) {
      toastDict.seldOut.push(curPrice);
      remainEnough = false;
    } else {
      toastDict.select = curPrice;
      priceBtn.parent().parent().parent().click();
      // 调整人数
      // 可能票数不够
      const addBtn = id("img_jia").findOne();
      for (let t in pref.visitors) {
        if (t > 0) {
          addBtn.click();
        }
        // const numElem = id("tv_num").findOne();
        // const numText = numElem.text();
        // num = parseInt(numText.match(/([0-9]+)张/)[1]);
        // console.log(num);
      }
      break;
    }
  }

  toast(
    `${toastDict.select ? `已选:${toastDict.select}` : ""}${
      toastDict.seldOut.length
        ? `${toastDict.select ? "," : ""}售空:${toastDict.seldOut.join(",")}`
        : ""
    }`
  );

  if (priceBtn) {
    id("btn_buy").findOne().click();

    // 选观演人
    id("text_name")
      .untilFind()
      .forEach((e) => {
        if (pref.visitors.includes(e.text())) {
          e.parent().findOne(checkable()).click();
        }
      });

    // 下滑，选择支付方式
    id("recycler_view").scrollForward();
    id("tv_pay_title")
      .text(pref.payMethod)
      .findOne()
      .parent()
      .parent()
      .parent()
      .click();

    text("提交订单").clickable().findOne().click();

    // 可能出现：库存不足、同一时间下单人数过多
    if (currentActivity() !== "cn.damai.ultron.view.activity.DmOrderActivity")
      desc("立即支付").clickable().findOne().click();
    break;
  } else {
    back();
  }
}
