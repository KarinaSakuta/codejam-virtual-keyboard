class TextArea {
  constructor() {
    const { body } = document;
    const textAreaContainer = document.createElement('textarea');
    body.appendChild(textAreaContainer);

    this.state = {
      textAreaContainer,
    };

    this.handlerClick();
  }

  handlerClick() {
    const { textAreaContainer } = this.state;

    document.addEventListener('mousedown', ({ target }) => {
      if (target.classList.contains('key')) {
        target.classList.add('active');
      }
    });

    document.addEventListener('mouseup', ({ target }) => {
      if (target.classList.contains('key')) {
        target.classList.remove('active');

        if (!target.classList.contains('no-word')) {
          textAreaContainer.innerHTML += target.innerHTML;
        } else if (target.dataset.noWord === 'delete') {
          textAreaContainer.innerHTML = textAreaContainer.innerHTML.slice(0,
            textAreaContainer.innerHTML.length - 1);
        } else if (target.dataset.noWord === 'Enter') {
          textAreaContainer.innerHTML += '\n';
        } else {
          textAreaContainer.innerHTML += target.dataset.noWord;
        }
      }
    });
  }
}

const textArea = new TextArea();

class Keyboard {
  constructor(textArea) {
    const { body } = document;
    const keyboardContainer = document.createElement('div');
    keyboardContainer.classList.add('keyboard-container');
    body.appendChild(keyboardContainer);

    this.state = {
      keyboard: [],
      pressedKeys: new Set(),
      language: 'symbolENG',
      isShiftPress: false,
      keyboardContainer,
      textArea: textArea.state.textAreaContainer,
    };

    this.loadJSON();
  }

  checkToShift(newState, keyCode) {
    let { isShiftPress } = this.state;

    if (keyCode === 16) isShiftPress = newState;
    this.state.isShiftPress = isShiftPress;
  }

  checkToChangeLanguage() {
    const { pressedKeys, isShiftPress, language } = this.state;
    const isAltPress = pressedKeys.has(18);
    const allKeys = pressedKeys.size;

    if (isShiftPress && isAltPress && allKeys === 2) {
      if (language === 'symbolENG') {
        this.setState({
          language: 'symbolRU',
        });
      } else {
        this.setState({
          language: 'symbolENG',
        });
      }
    }
  }

  handlerKeyEvents() {
    document.addEventListener('keydown', ({ keyCode }) => {
      event.preventDefault();

      const { pressedKeys } = this.state;
      if (pressedKeys.has(keyCode)) return;
      pressedKeys.add(keyCode);

      this.checkToShift(true, keyCode);

      this.setState({
        pressedKeys,
      });
    });

    document.addEventListener('keyup', ({ keyCode }) => {
      this.checkToChangeLanguage();

      const { pressedKeys } = this.state;
      pressedKeys.delete(keyCode);

      this.checkToShift(false, keyCode);

      this.setState({
        pressedKeys,
      });
    });
  }

  async loadJSON() {
    const res = await fetch('data/keyboard.json');
    const json = await res.json();

    this.setState({
      keyboard: json,
    });

    this.handlerKeyEvents();
  }

  setState(obj) {
    this.state = {
      ...this.state,
      ...obj,
    };

    this.render();
  }

  render() {
    const {
      keyboard,
      pressedKeys,
      language,
      isShiftPress,
      keyboardContainer,
      textArea1,
    } = this.state;

    keyboardContainer.innerHTML = '';

    keyboard.forEach((row) => {
      let rowHTML = '';

      row.forEach((item) => {
        const { keyCode, noWord } = item;
        const prop = `${language}${isShiftPress ? 'Shift' : ''}`;
        const symbol = item[prop];
        const isPress = pressedKeys.has(keyCode);
        const isComand = (typeof item.noWord) === 'string';

        if (isPress) {
          if (!isComand) {
            textArea1.innerHTML += symbol;
          } else if (noWord === 'delete') {
            const arrSymbol = textArea1.innerHTML.split('');
            arrSymbol.pop();
            textArea1.innerHTML = arrSymbol.join('');
          } else if (noWord === 'Enter') {
            textArea1.innerHTML += '\n';
          } else {
            textArea1.innerHTML += noWord;
          }
        }

        rowHTML
          += `<div 
            class="key ${isComand ? 'no-word' : ''} ${isPress ? 'active' : ''}" 
            data-index="${keyCode}"
            data-no-word="${noWord}"
          >${symbol}</div>`;
      });

      keyboardContainer.innerHTML += `<div class="row">${rowHTML}</div>`;
    });
  }
}

const keyboard = new Keyboard(textArea);
