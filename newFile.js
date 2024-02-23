document.addEventListener('DOMContentLoaded', function () {
  // Traiter ici la partie Javascript/AJAX de l'exercice
  const addForm = document.querySelector('#add-book');
  const addFormInputs = Array.from(addForm.elements).filter(el => el.tagName === 'INPUT' && el.id !== 'ref');
  const addFormRefInput = Array.from(addForm.elements).filter(el => el.tagName === 'INPUT' && el.id === 'ref')[0];
  const addErrorMsg = document.querySelector('#add-error-msg');
  const searchForm = document.querySelector('#search-book');

  const inputErrors = [];
  const errorMsgs = [];
  const inputValues = ['', ''];

  function isAddInputOk(input) {
    let isOk = true;
    let errMsg = '';

    if (input.length < 2 || input.length > 255 || !input.match(/^[a-zA-Z]{2}/g)) {
      isOk = false;
      errMsg = 'lengthError';
    } else if (!input.match(/^[a-zA-Z0-9_\-\s.]+$/g)) {
      isOk = false;
      errMsg = 'characError';
    }

    return [isOk, errMsg];
  }

  function cleanInput(input) {
    return input.replace(/[^a-zA-Z0-9_\-\s.]/g, '');
  }

  async function checkBddForInput(inputId, inputValue) {
    const formData = new FormData();
    formData.append('inputId', inputId);
    formData.append('inputValue', inputValue);

    const res = await fetch('./cible/check_db.php', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data;
  }

  async function generateRef(values) {
    let ref = '';
    values.forEach(value => (ref += value.substring(0, 2).toUpperCase()));

    // check existing identicals letters refs
    const existingRefs = await checkBddForInput('ref', ref).then(data => data.values);
    if (existingRefs > 0) {
      const nb = String(existingRefs + 1).padStart(4, '0');
      ref += nb;
    } else {
      ref += '0001';
    }

    addFormRefInput.value = ref;
  }

  function addInputError(el, id, inputError) {
    inputErrors[id] = true;

    el.classList.add('border', 'border-danger');

    addFormRefInput.value = '';

    switch (inputError) {
      case 'characError':
        errorMsgs[id] = `Uniquement lettres, chiffres et . - _ pour le champ ${el.labels[0].innerHTML}`;
        break;
      case 'lengthError':
        errorMsgs[id] = `2 lettres minimum requises pour le champ ${el.labels[0].innerHTML}`;
        break;
      case 'existingTitle':
        errorMsgs[id] = 'Titre déjà enregistré';
        break;
      default:
        errorMsgs[id] = "Erreur d'entrée dans le formulaire";
    }
  }

  // Error handling for Add form
  addFormInputs.forEach((el, id) => {
    el.addEventListener('input', async () => {
      const [isInputOk, inputError] = isAddInputOk(el.value);

      if (!isInputOk) {
        addInputError(el, id, inputError);
      } else {
        errorMsgs[id] = '';
        inputErrors[id] = false;
        inputValues[id] = el.value;

        el.classList.remove('border', 'border-danger');

        if (el.id === 'title') {
          const sameTitles = await checkBddForInput('title', el.value).then(data => data.values);
          if (sameTitles > 0) {
            inputErrors[id] = true;

            el.classList.add('border', 'border-danger');

            addInputError(el, id, 'existingTitle');
          } else {
            inputErrors[id] = false;
          }
        }
      }

      if (inputErrors.includes(true)) {
        addErrorMsg.classList.remove('invisible');
        addErrorMsg.classList.add('visible');
        addErrorMsg.innerText = errorMsgs.toString();
      } else {
        addErrorMsg.classList.add('invisible');
        addErrorMsg.classList.remove('visible');
        addErrorMsg.innerText = '';
        errorMsgs.length = 0;

        if (inputValues.every(el => el.length >= 2)) {
          setTimeout(() => {
            generateRef(inputValues);
          }, 1000);
        }
      }
    });
  });

  addForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (addErrorMsg.innerText) return;
  });
});
