module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
      "react/jsx-filename-extension": 0,
      "import/prefer-default-export": 0,
      "react/prop-types": 0,
      "react/jsx-props-no-spreading": 0,
      "react/destructuring-assignment": 0,
      "jsx-a11y/label-has-associated-control": 0,
      "jsx-a11y/control-has-associated-label": 0,
      "jsx-a11y/anchor-is-valid": 0,
      "react/no-deprecated": 1,
      "linebreak-style": 0,  //去除eslint控制 LF/CRLF的判断
      "max-len": [0, 200, 4], //每行太多老要回车 
      "no-param-reassign": [0], //禁止给参数重新赋值
      "react/no-unused-state": 0,
      "no-return-assign": 0,
      "no-console": "on",
    }
};
