<template>
  <div class="form">
    <el-form ref="form" label-position="top" :model="form" :rules="currentRules" :hideRequiredAsterisk="true">
      <fieldset class="form-group">
        <legend>Личные данные</legend>

        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="Фамилия" prop="lastName" :rules="nameRules">
              <el-input v-model.trim="form.lastName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Имя" prop="firstName" :rules="nameRules">
              <el-input v-model.trim="form.firstName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Отчество" prop="patronymic" :rules="patronymicRules">
              <el-input v-model.trim="form.patronymic" :disabled="isNoPatronymic" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="16">
            <span class="explanation">
              {{ isForeigner ? 'Иностранцы заполняют латинскими буквами. Например, Ivanov Ivan' : '&nbsp;' }}
            </span>
          </el-col>
          <el-col :span="8">
            <el-checkbox label="Нет отчества" v-model="isNoPatronymic" @change="onPatronymicNeedChange" />
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="Дата рождения" prop="birthDate">
              <el-date-picker format="dd.MM.yyyy" type="date" v-model="form.birthDate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="E-mail" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item label="Пол" size="small" prop="sex">
          <el-radio v-model="form.sex" label="male">Мужской</el-radio>
          <el-radio v-model="form.sex" label="female">Женский</el-radio>
        </el-form-item>
      </fieldset>

      <fieldset class="form-group">
        <legend>Паспортные данные</legend>

        <el-form-item label="Гражданство" prop="citizenship">
          <el-select
            filterable
            v-model="form.citizenship"
            :filter-method="filterMethod"
            @blur="clearFilter"
            @change="onCitizenshipChange"
          >
            <el-option v-for="item in filteredCitizenships" :key="item.id" :label="item.nationality" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-row :gutter="10" v-if="!isForeigner">
          <el-col :span="6">
            <el-form-item label="Серия паспорта" prop="passportSerial" :rules="passportSerialRules">
              <el-input v-model="form.passportSerial" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Номер паспорта" prop="passportNumber" :rules="passportNumberRules">
              <el-input v-model="form.passportNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Дата выдачи" prop="passportIssued" :rules="passportIssuedRules">
              <el-date-picker v-model="form.passportIssued" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-else :gutter="10">
          <el-col :span="8">
            <el-form-item label="Тип паспорта" prop="passportType" :rules="passportTypeRules">
              <el-select v-model="form.passportType" placeholder="">
                <el-option v-for="item in passportTypes" :key="item.id" :label="item.type" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Номер паспорта" prop="passportNumber" :rules="passportNumberRules">
              <el-input v-model="form.passportNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Страна выдачи" prop="passportCountry" :rules="passportCountryRules">
              <el-select v-model="form.passportCountry" placeholder="">
                <el-option
                  v-for="item in countries"
                  :key="item.global_id"
                  :label="item.SHORTNAME"
                  :value="item.global_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Меняли ли фамилию или имя?" size="small">
          <el-radio v-model="form.isNameWasChanged" :label="false">Нет</el-radio>
          <el-radio v-model="form.isNameWasChanged" :label="true">Да</el-radio>
        </el-form-item>

        <el-row v-show="form.isNameWasChanged" :gutter="10">
          <el-col :span="8">
            <el-form-item label="Предыдущая фамилия" prop="prevLastName" :rules="prevNameRules">
              <el-input v-model="form.prevLastName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Предыдущее имя" prop="prevFirstName" :rules="prevNameRules">
              <el-input v-model="form.prevFirstName" />
            </el-form-item>
          </el-col>
        </el-row>
      </fieldset>

      <el-form-item align="right">
        <el-button type="primary" @click="submit">Отправить</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import formatISO from 'date-fns/formatISO';

import { isDateLessThanCurrent, isLatinLetters, isRussianLetters } from '@/utils/validators';

import citizenships from '@/assets/data/citizenships.json';
import countries from '@/assets/data/countries.json';
import passportTypes from '@/assets/data/passport-types.json';

export default {
  data() {
    return {
      isNoPatronymic: false,
      currentCitizenship: null,

      form: {
        lastName: null,
        firstName: null,
        patronymic: null,
        birthDate: null,
        email: null,
        sex: 'male',

        citizenship: null,
        passportSerial: null,
        passportNumber: null,
        passportIssued: null,
        passportCountry: null,
        passportType: null,

        isNameWasChanged: false,
      },

      filter: '',

      currentRules: null,
      rules: {
        birthDate: [
          { required: true, trigger: 'blur', message: 'Обязательное поле' },
          { validator: isDateLessThanCurrent, trigger: 'blur' },
        ],
        email: [
          { required: true, trigger: 'blur', message: 'Обязательное поле' },
          { type: 'email', trigger: 'blur', message: 'Адрес не верен' },
        ],
        citizenship: [{ required: true, message: 'Обязательное поле' }],
      },
    };
  },

  computed: {
    citizenships() {
      const c = citizenships ?? [];
      c.sort((a, b) => String(a?.nationality).localeCompare(String(b?.nationality)));
      return c;
    },
    filteredCitizenships() {
      const filter = this.filter.toLowerCase();
      return this.citizenships.filter((item) => String(item?.nationality).toLowerCase().includes(filter));
    },
    countries() {
      return countries ?? [];
    },
    passportTypes() {
      return passportTypes ?? [];
    },

    isForeigner() {
      return this.currentCitizenship && this.currentCitizenship !== 'Russia';
    },

    nameRules() {
      const rules = [{ required: true, trigger: 'blur', message: 'Обязательное поле' }];

      rules.push({
        validator: this.isForeigner ? isLatinLetters : isRussianLetters,
        trigger: 'blur',
      });

      return rules;
    },
    patronymicRules() {
      if (this.isNoPatronymic) return [];

      return [
        { required: true, trigger: 'blur', message: 'Обязательное поле' },
        {
          validator: this.isForeigner ? isLatinLetters : isRussianLetters,
          trigger: 'blur',
        },
      ];
    },
    prevNameRules() {
      if (!this.form.isNameWasChanged) return [];

      return [
        { required: true, trigger: 'blur', message: 'Обязательное поле' },
        {
          validator: this.isForeigner ? isLatinLetters : isRussianLetters,
          trigger: 'blur',
        },
      ];
    },
    passportNumberRules() {
      const rules = [{ required: true, trigger: 'blur', message: 'Обязательное поле' }];

      if (!this.isForeigner) {
        rules.push({
          len: 6,
          trigger: 'blur',
          message: '6 цифр',
        });
      }

      return rules;
    },
    passportSerialRules() {
      return this.isForeigner
        ? []
        : [
            { required: true, trigger: 'blur', message: 'Обязательное поле' },
            { len: 4, message: '4 цифры', trigger: 'blur' },
          ];
    },
    passportTypeRules() {
      return this.isForeigner ? [{ required: true, message: 'Обязательное поле' }] : [];
    },
    passportCountryRules() {
      return this.isForeigner ? [{ required: true, message: 'Обязательное поле' }] : [];
    },
    passportIssuedRules() {
      return this.isForeigner
        ? []
        : [
            { required: true, trigger: 'blur', message: 'Обязательное поле' },
            { validator: isDateLessThanCurrent, trigger: 'blur' },
          ];
    },
  },

  created() {
    this.currentRules = this.rules;

    const c = this.citizenships.find((item) => item.nationality === 'Russia');
    this.form.citizenship = c?.id;
    this.currentCitizenship = c?.nationality;
  },

  methods: {
    filterMethod: debounce(function (value) {
      this.filter = value;
    }, 500),
    clearFilter() {
      setTimeout(() => (this.filter = ''), 100);
    },

    clearRules() {
      this.currentRules = null;
    },

    onPatronymicNeedChange() {
      this.form.patronymic = null;
      this.$refs.form?.clearValidate(['patronymic']);
    },
    onCitizenshipChange() {
      this.currentCitizenship = this.citizenships.find((item) => item.id === this.form.citizenship)?.nationality;

      this.$refs.form?.clearValidate(['lastName', 'firstName', 'patronymic']);
    },

    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const data = {
            ...this.form,
            birthDate: formatISO(this.form.birthDate, { representation: 'date' }),
          };

          this.clearRules();

          console.log(JSON.stringify(data));
        }
      });
    },
  },
};
</script>

<style>
.form .el-form-item {
  margin-bottom: 14px;
}
.form .el-form--label-top .el-form-item__label {
  display: initial;
  padding: 0;
}
</style>

<style scoped>
.form {
  background-color: white;
  border: 1px solid gainsboro;
  padding: 20px;
  width: 700px;
}

.form .form-group {
  border: 0;
  margin-bottom: 26px;
}
.form .form-group legend {
  margin-bottom: 12px;
  font-weight: 600;
}
.form .explanation {
  color: darkgray;
  font-size: 12px;
}
</style>
