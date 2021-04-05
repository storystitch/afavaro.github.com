document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("wf-form-eitc-form");
  var filingStatus = document.getElementById("filing-status");
  var numChildren = document.getElementById("children");
  var agi = document.getElementById("AGI");
  var eitcValue = document.getElementById("eitc-value");
  var errorContainer = document.getElementById("error-container");
  var errorDiv = document.getElementById("error-msg");

  form.addEventListener("submit", function() {
    var errorMsg = null;
    if (filingStatus.value < 0) {
      errorMsg = "Please select your filing status.";
    } else if (numChildren.value < 0) {
      errorMsg = "Please select your number of children.";
    } else if (agi.value <= 0) {
      errorMsg = "Please enter your Adjusted Gross Income.";
    }
    if (errorMsg != null) {
      errorDiv.innerHTML = errorMsg;
      errorContainer.style.display = "block";
      return false;
    }

    var eitcAmount = calcEITC(filingStatus.value, numChildren.value, agi.value);
    eitcValue.innerHTML = "$" + eitcAmount.toLocaleString();
  });
});

const FilingStatus = {
  single: 1,
  marriedJoint: 2,
  marriedSeparate: 3,
  headOfHousehold: 4,
  widow: 5
};

const MARRIED_JOINT_BRACKETS = [
  {
    minimumIncome: 7030,
    creditRate: 0.0765,
    phaseoutBeginningIncome: 14680,
    phaseoutPercent: 0.0765,
    phaseoutEndingIncome: 21710
  },
  {
    minimumIncome: 10540,
    creditRate: 0.34,
    phaseoutBeginningIncome: 25220,
    phaseoutPercent: 0.1598,
    phaseoutEndingIncome: 47646
  },
  {
    minimumIncome: 14800,
    creditRate: 0.4,
    phaseoutBeginningIncome: 25220,
    phaseoutPercent: 0.2106,
    phaseoutEndingIncome: 53330
  },
  {
    minimumIncome: 14800,
    creditRate: 0.45,
    phaseoutBeginningIncome: 25220,
    phaseoutPercent: 0.2106,
    phaseoutEndingIncome: 56844
  }
];

const SINGLE_BRACKETS = [
  {
    minimumIncome: 9820,
    creditRate: 0.153,
    phaseoutBeginningIncome: 11610,
    phaseoutPercent: 0.153,
    phaseoutEndingIncome: 21427
  },
  {
    minimumIncome: 10540,
    creditRate: 0.34,
    phaseoutBeginningIncome: 19330,
    phaseoutPercent: 0.1598,
    phaseoutEndingIncome: 41756
  },
  {
    minimumIncome: 14800,
    creditRate: 0.4,
    phaseoutBeginningIncome: 19330,
    phaseoutPercent: 0.2106,
    phaseoutEndingIncome: 47440
  },
  {
    minimumIncome: 14800,
    creditRate: 0.45,
    phaseoutBeginningIncome: 19330,
    phaseoutPercent: 0.2106,
    phaseoutEndingIncome: 50954
  }
];

function calcEITC(filingStatus, numChildren, agi) {
  if (filingStatus == FilingStatus.marriedJoint) {
    var brackets = MARRIED_JOINT_BRACKETS;
  } else if (
    filingStatus == FilingStatus.single 
    || filingStatus == FilingStatus.headOfHousehold
    || filingStatus == FilingStatus.window
  ) {
    var brackets = SINGLE_BRACKETS;
  } else { // Married separate
    return 0;
  }
  var bracket = brackets[Math.min(numChildren, 3)];

  var wagesRounded = (agi === 0 ? 0 : Math.floor(agi / 50) * 50 + 25);
  var potEITC = Math.min(wagesRounded, bracket.minimumIncome) * bracket.creditRate;
  var phaseoutEITC = 
    Math.max(0, wagesRounded - bracket.phaseoutBeginningIncome) * bracket.phaseoutPercent;
  var eitcAmount = Math.round(Math.max(0, potEITC - phaseoutEITC));

  if (agi == 0) {
    eitcAmount = 0;
  }

  return eitcAmount;
}
