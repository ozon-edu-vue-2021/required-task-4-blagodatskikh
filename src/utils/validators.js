export const isLatinLetters = (rule, value, callback) => {
  const match = String(value).match(/^[A-Z][a-z]*$/i);

  if (match) {
    callback();
  } else {
    callback(new Error('Только латинские буквы'));
  }
};

export const isRussianLetters = (rule, value, callback) => {
  const match = String(value).match(/^[А-ЯЁ][а-яЁ]*$/i);

  if (match) {
    callback();
  } else {
    callback(new Error('Только русские буквы'));
  }
};

export const isDateLessThanCurrent = (rule, value, callback) => {
  const diff = new Date().getTime() - new Date(value).getTime();

  if (diff < 0) {
    callback(new Error('Значение больше текущей даты'));
  } else {
    callback();
  }
};
