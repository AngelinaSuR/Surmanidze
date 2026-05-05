const formatUAH = (value) => new Intl.NumberFormat("uk-UA", {
  style: "currency",
  currency: "UAH",
  maximumFractionDigits: 0
}).format(value);

function initCalculator() {
  const form = document.getElementById("creditForm");
  if (!form) {
    return;
  }

  const amount = document.getElementById("amount");
  const months = document.getElementById("months");
  const rate = document.getElementById("rate");

  const amountHint = document.getElementById("amountHint");
  const monthsHint = document.getElementById("monthsHint");
  const rateHint = document.getElementById("rateHint");

  const monthlyPaymentNode = document.getElementById("monthlyPayment");
  const totalPaymentNode = document.getElementById("totalPayment");
  const overpaymentNode = document.getElementById("overpayment");

  const amountRange = document.getElementById("amountRange");
  const monthsRange = document.getElementById("monthsRange");
  const rateRange = document.getElementById("rateRange");

  const sync = (input, range) => {
    input.addEventListener("input", () => {
      range.value = input.value;
      update();
    });
    range.addEventListener("input", () => {
      input.value = range.value;
      update();
    });
  };

  function update() {
    const principal = Number(amount.value);
    const termMonths = Number(months.value);
    const annualRate = Number(rate.value);

    amountHint.textContent = `${new Intl.NumberFormat("uk-UA").format(principal)} грн`;
    monthsHint.textContent = `${termMonths} міс`;
    rateHint.textContent = `${annualRate.toFixed(1)}%`;

    if (principal <= 0 || termMonths <= 0 || annualRate <= 0) {
      monthlyPaymentNode.textContent = "—";
      totalPaymentNode.textContent = "—";
      overpaymentNode.textContent = "—";
      return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, termMonths);
    const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
    const totalPayment = monthlyPayment * termMonths;
    const overpayment = totalPayment - principal;

    monthlyPaymentNode.textContent = formatUAH(monthlyPayment);
    totalPaymentNode.textContent = formatUAH(totalPayment);
    overpaymentNode.textContent = formatUAH(overpayment);
  }

  sync(amount, amountRange);
  sync(months, monthsRange);
  sync(rate, rateRange);
  form.addEventListener("submit", (event) => event.preventDefault());
  update();
}

function initPrograms() {
  const programsRoot = document.getElementById("programsRoot");
  if (!programsRoot) {
    return;
  }

  const data = [
    { name: "Старт Капітал", maxAmount: 500000, term: 24, rate: 19.5, type: "Оборотні кошти" },
    { name: "Розвиток Плюс", maxAmount: 1500000, term: 36, rate: 17.8, type: "Розширення бізнесу" },
    { name: "Техніка Бізнес", maxAmount: 2500000, term: 48, rate: 16.9, type: "Обладнання" },
    { name: "Експорт Лінія", maxAmount: 4000000, term: 60, rate: 15.4, type: "Експортні контракти" }
  ];

  const amountNeed = document.getElementById("amountNeed");
  const termNeed = document.getElementById("termNeed");
  const list = document.getElementById("programList");

  function render() {
    const amountVal = Number(amountNeed.value);
    const termVal = Number(termNeed.value);

    const filtered = data.filter((item) => item.maxAmount >= amountVal && item.term >= termVal);
    list.innerHTML = "";

    if (!filtered.length) {
      list.innerHTML = "<p>За цими параметрами програми не знайдено. Спробуйте зменшити суму або термін.</p>";
      return;
    }

    filtered.forEach((item) => {
      const node = document.createElement("article");
      node.className = "program-item";
      node.innerHTML = `
        <h4>${item.name}</h4>
        <p><span class="pill">${item.type}</span></p>
        <p>Макс. сума: <b>${formatUAH(item.maxAmount)}</b></p>
        <p>Термін: <b>до ${item.term} міс.</b></p>
        <p>Орієнтовна ставка: <b>${item.rate}% річних</b></p>
      `;
      list.appendChild(node);
    });
  }

  amountNeed.addEventListener("input", render);
  termNeed.addEventListener("input", render);
  render();
}

function initTabs() {
  const tabs = document.querySelectorAll("[data-tabs]");
  tabs.forEach((tabsRoot) => {
    const buttons = tabsRoot.querySelectorAll(".tab-btn");
    const panes = tabsRoot.querySelectorAll(".tab-pane");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        buttons.forEach((b) => b.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const pane = tabsRoot.querySelector(`#${target}`);
        if (pane) pane.classList.add("active");
      });
    });
  });
}

function initServiceCalc() {
  const serviceRoot = document.getElementById("serviceCalc");
  if (!serviceRoot) {
    return;
  }

  const checkboxes = serviceRoot.querySelectorAll("input[type='checkbox']");
  const totalNode = document.getElementById("serviceTotal");

  function updateTotal() {
    let total = 0;
    checkboxes.forEach((cb) => {
      if (cb.checked) {
        total += Number(cb.value);
      }
    });
    totalNode.textContent = formatUAH(total);
  }

  checkboxes.forEach((cb) => cb.addEventListener("change", updateTotal));
  updateTotal();
}

function initReadinessForm() {
  const root = document.getElementById("readinessForm");
  if (!root) {
    return;
  }

  const revenue = document.getElementById("rev");
  const expenses = document.getElementById("exp");
  const existing = document.getElementById("existLoan");
  const output = document.getElementById("readinessResult");

  function score() {
    const cashflow = Number(revenue.value) - Number(expenses.value);
    const debtLoad = Number(existing.value);
    const ratio = cashflow > 0 ? debtLoad / cashflow : 2;

    if (cashflow <= 0) {
      output.textContent = "Негативний кешфлоу. Рекомендація: оптимізувати витрати перед кредитуванням.";
      return;
    }
    if (ratio < 0.25) {
      output.textContent = "Висока готовність до кредиту. Поточне боргове навантаження контрольоване.";
      return;
    }
    if (ratio < 0.5) {
      output.textContent = "Середня готовність. Бажано обрати програму з довшим терміном і нижчим платежем.";
      return;
    }
    output.textContent = "Підвищене навантаження. Рекомендація: зменшити суму нового фінансування.";
  }

  [revenue, expenses, existing].forEach((el) => el.addEventListener("input", score));
  score();
}

document.addEventListener("DOMContentLoaded", () => {
  initCalculator();
  initPrograms();
  initTabs();
  initServiceCalc();
  initReadinessForm();
});
