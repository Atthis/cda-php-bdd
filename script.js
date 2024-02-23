document.addEventListener('DOMContentLoaded', function () {
  // Traiter ici la partie Javascript/AJAX de l'exercice
  const addForm = document.querySelector('#add-book');
  const addFormInputs = Array.from(addForm.elements).filter(el => el.tagName === 'INPUT' && el.id !== 'ref');
  const addFormRefInput = Array.from(addForm.elements).filter(el => el.tagName === 'INPUT' && el.id === 'ref')[0];
  const addMsg = document.querySelector('#add-msg');

  const searchForm = document.querySelector('#search-book');
  const searchMsg = document.querySelector('#search-msg');

  const inputErrors = [];
  const errorMsgs = [];
  const inputValues = ['', ''];

  function isAddInputOk(input) {
    let isOk = true;
    let errMsg = '';

    if (input.length < 2 || input.length > 255) {
      isOk = false;
      errMsg = 'lengthError';
    } else if (!input.match(/^[A-zÀ-ú0-9_\-\'\s.]+$/g)) {
      isOk = false;
      errMsg = 'characError';
    }

    return [isOk, errMsg];
  }

  async function checkBddForInput(inputId, inputValue) {
    const formData = new FormData();
    formData.append('inputId', inputId);
    formData.append('inputValue', inputValue);

    const res = await fetch('./cible/check_db.php', {
      method: 'POST',
      body: formData,
    });

    // console.log(await res.text());

    const data = await res.json();
    return data;
  }

  async function generateRef(values) {
    let ref = '';
    values.forEach(
      value =>
        (ref += value
          .normalize('NFD')
          .replace(/[^\w\ ]/g, '')
          .substring(0, 2)
          .toUpperCase())
    );

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
        addMsg.classList.remove('invisible');
        addMsg.classList.add('visible', 'alert-warning');
        addMsg.innerText = errorMsgs.toString();
      } else {
        addMsg.classList.add('invisible');
        addMsg.classList.remove('visible', 'alert-warning');
        addMsg.innerText = '';
        errorMsgs.length = 0;

        if (inputValues.every(el => el.length >= 2)) {
          setTimeout(() => {
            generateRef(inputValues);
          }, 1000);
        }
      }
    });
  });

  // Add form submit handling
  addForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (addMsg.innerText) return;

    const formData = new FormData(e.target);
    const response = await fetch('./cible/ajouter_livre.php', {
      method: 'POST',
      body: formData,
    });

    let data = {
      message: '',
      status: '',
    };

    try {
      const resData = await response.json();
      console.log(resData);
      data.message = resData.message;
      data.status = resData.status;
    } catch (e) {
      console.log(e);
      data.message = 'Livre bien ajouté, mais erreur de format de réponse.';
      data.status = 'error';
    }

    console.log(inputErrors, '===', errorMsgs);

    addMsg.innerText = data.message;
    addMsg.classList.remove('invisible');
    addMsg.classList.add('visible');
    addMsg.classList.add(data.status === 'success' ? 'alert-success' : 'alert-danger');

    setInterval(() => {
      addMsg.innerText = '';
      addMsg.classList.add('invisible');
      addMsg.classList.remove('visible', 'alert-success', 'alert-danger');
      // addMsg.classList.add(data.status === 'success' ? 'alert-success' : 'alert-danger');
    }, 3000);

    if (data.status === 'success') {
      [...addFormInputs, addFormRefInput].forEach(input => (input.value = ''));
    }
  });

  searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    // if (searchMsg.innerText) return;

    const formData = new FormData(e.target);
    const response = await fetch('./cible/chercher_livre.php', {
      method: 'POST',
      body: formData,
    });

    let data = {};

    try {
      const resData = await response.json();
      data = resData;
      // data.message = resData.message;
      // data.status = resData.status;
    } catch (e) {
      console.log(e);
      // data.message = 'Erreur de format de réponse.';
      // data.status = 'error';
    }

    if (!data.data) {
      searchMsg.innerHTML = data.message;
      return;
    }

    searchMsg.innerHTML = `
			<ul>
				<li>Titre du livre : ${data.data.titre}</li>
				<li>Auteur du livre : ${data.data.auteur}</li>
				<li>Référence : ${data.data.reference}</li>
			</ul>
		`;
  });
});
