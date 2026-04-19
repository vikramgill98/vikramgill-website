// Shared interactions for navigation, reveals, and the lead form.
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const currentPage = document.body.dataset.page;

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  if (link.dataset.nav === currentPage) {
    link.classList.add("active");
  }

  link.addEventListener("click", () => {
    header?.classList.remove("menu-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  // Reveal content once as it enters the viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const quoteForm = document.querySelector("#quote-form");
const formMessage = document.querySelector(".form-message");
const serviceField = document.querySelector("#selected_service");
const questionFieldOne = document.querySelector("#service_question_1");
const answerFieldOne = document.querySelector("#service_answer_1");
const questionFieldTwo = document.querySelector("#service_question_2");
const answerFieldTwo = document.querySelector("#service_answer_2");
const questionLabelOne = document.querySelector("#dynamic-question-label-1");
const questionLabelTwo = document.querySelector("#dynamic-question-label-2");
const dynamicChoiceGridOne = document.querySelector("#dynamic-choice-grid-1");
const dynamicChoiceGridTwo = document.querySelector("#dynamic-choice-grid-2");
const progressFill = document.querySelector(".form-progress-fill");
const progressSteps = document.querySelectorAll(".progress-step");
const formSteps = document.querySelectorAll(".form-step");
const prevButtons = document.querySelectorAll("[data-prev-step]");
const serviceChoices = document.querySelectorAll(".choice-card[data-service]");

const serviceQuestions = {
  "Auto Insurance": {
    questions: [
      {
        label: "What are you looking for?",
        options: ["New policy", "Renew", "Switch provider"]
      },
      {
        label: "When do you need coverage?",
        options: ["Immediately", "Within 7 days", "Just exploring"]
      }
    ]
  },
  "Home Insurance": {
    questions: [
      {
        label: "Property status?",
        options: ["Own", "Renting", "Buying soon"]
      },
      {
        label: "When do you need coverage?",
        options: ["Immediately", "Within 7 days", "Just exploring"]
      }
    ]
  },
  "Business Insurance": {
    questions: [
      {
        label: "Business stage?",
        options: ["Starting", "Running", "Expanding"]
      },
      {
        label: "Type of business?",
        options: ["Retail", "Professional services", "Contractor or trades", "Office business"]
      }
    ]
  },
  "Commercial Vehicle Insurance": {
    questions: [
      {
        label: "Usage?",
        options: ["Personal", "Business", "Transport"]
      },
      {
        label: "Coverage timing?",
        options: ["Immediately", "Within 7 days", "Just exploring"]
      }
    ]
  },
  Mortgage: {
    questions: [
      {
        label: "Goal?",
        options: ["First home", "Refinance", "Investment"]
      },
      {
        label: "Timeline?",
        options: ["ASAP", "1-3 months", "Just exploring"]
      }
    ]
  }
};

let currentStep = 1;
let autoAdvanceTimer;

function clearAutoAdvance() {
  if (autoAdvanceTimer) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = undefined;
  }
}

function scheduleAutoAdvance(targetStep) {
  clearAutoAdvance();
  autoAdvanceTimer = window.setTimeout(() => {
    showStep(targetStep);
  }, 380);
}

function updateProgress(step) {
  if (!progressFill) return;

  progressFill.style.width = `${(step / 3) * 100}%`;
  progressSteps.forEach((item, index) => {
    item.classList.toggle("is-active", index < step);
  });
}

function showStep(step) {
  clearAutoAdvance();
  const activeStep = document.querySelector(`.form-step.is-active`);
  if (activeStep && Number(activeStep.dataset.step) !== step) {
    activeStep.classList.add("is-exiting");
    window.setTimeout(() => {
      activeStep.classList.remove("is-exiting");
    }, 280);
  }

  currentStep = step;
  formSteps.forEach((item) => {
    item.classList.toggle("is-active", Number(item.dataset.step) === step);
  });
  updateProgress(step);
}

function setService(service) {
  const config = serviceQuestions[service];
  if (
    !config ||
    !serviceField ||
    !questionFieldOne ||
    !answerFieldOne ||
    !questionFieldTwo ||
    !answerFieldTwo ||
    !questionLabelOne ||
    !questionLabelTwo ||
    !dynamicChoiceGridOne ||
    !dynamicChoiceGridTwo
  ) {
    return;
  }

  serviceField.value = service;
  questionFieldOne.value = config.questions[0].label;
  answerFieldOne.value = "";
  questionFieldTwo.value = config.questions[1].label;
  answerFieldTwo.value = "";
  questionLabelOne.textContent = config.questions[0].label;
  questionLabelTwo.textContent = config.questions[1].label;
  dynamicChoiceGridOne.innerHTML = "";
  dynamicChoiceGridTwo.innerHTML = "";

  renderQuestionOptions(
    dynamicChoiceGridOne,
    config.questions[0].options,
    answerFieldOne,
    "Select one option to continue"
  );
  renderQuestionOptions(
    dynamicChoiceGridTwo,
    config.questions[1].options,
    answerFieldTwo,
    "Choose the timing or fit that suits you"
  );
}

function renderQuestionOptions(container, options, targetField, metaText) {
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.dataset.answer = option;
    button.innerHTML = `<span class="choice-card-title">${option}</span><span class="choice-card-meta">${metaText}</span>`;

    button.addEventListener("click", () => {
      container.querySelectorAll(".choice-card").forEach((card) => {
        card.classList.remove("is-selected");
      });
      button.classList.add("is-selected");
      targetField.value = option;
      formMessage.textContent = "";

      if (currentStep === 2 && answerFieldOne?.value && answerFieldTwo?.value) {
        scheduleAutoAdvance(3);
      }
    });

    container.appendChild(button);
  });
}

function validateStep(step) {
  if (!formMessage) return true;

  formMessage.textContent = "";

  if (step === 1 && !serviceField?.value) {
    formMessage.textContent = "Please select a service to continue.";
    return false;
  }

  if (step === 2 && (!answerFieldOne?.value || !answerFieldTwo?.value)) {
    formMessage.textContent = "Please answer both quick questions to continue.";
    return false;
  }

  if (step === 3 && quoteForm) {
    const requiredFields = quoteForm.querySelectorAll("input[required]");
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        formMessage.textContent = "Please complete your contact details before submitting.";
        field.focus();
        return false;
      }
    }
  }

  return true;
}

serviceChoices.forEach((button) => {
  button.addEventListener("click", () => {
    serviceChoices.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    setService(button.dataset.service);
    scheduleAutoAdvance(2);
  });
});

prevButtons.forEach((button) => {
  button.addEventListener("click", () => {
    formMessage.textContent = "";
    showStep(Math.max(currentStep - 1, 1));
  });
});

if (quoteForm && formMessage) {
  quoteForm.addEventListener("submit", (event) => {
    if (!validateStep(3)) {
      event.preventDefault();
      return;
    }

    const service = serviceField?.value || "quote";
    formMessage.textContent = `Submitting your ${service.toLowerCase()} request...`;
  });
}
