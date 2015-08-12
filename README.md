# diaryReport
Формирование отчетов (из JSON в PNG) с помощью fabric.js.

##Описание входящих данных

Функции diaryReport(jsonObject) на вход будут приходить JSON следующего формата.

``` json
  {
    "items": [
      {
        "type": "type_of_item",
        "data": {"Данные":1}
      },
      {"..."}
    ]
  }

```

*items* - Массив строк, из которых будет строится отчет.

*items.type* - Тип строки.

*items.data* - Данные необходимые для отрисоки данной строки. Это может быть объект, строка, массив, число  и т.п.


###Тип строки - **header**

Данный тип строки служит для отображения заголовка отчета.

``` json
    {
      "type": "header",
      "data": "Женский комплекс упражнений 'три в одном'"
    }
```

![](http://storage-145851-1.cs.clodoserver.ru/test/header.png)

###Тип строки - **subHeader**

Заголовок 2 уровня.

``` json
    {
      "type": "subHeader",
      "data": "Первая тренировка   11:00 - 12:00"
    }
```

![](http://storage-145851-1.cs.clodoserver.ru/test/subHeader.png)

###Тип строки - **text**

Абзац с текстом. 

*maxWidth* - Максимальная ширина абазаца.

``` json
    {
      "type": "text",
      "data": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. ...",
      maxWidth: 400
    }
```

![](http://storage-145851-1.cs.clodoserver.ru/test/blockList.png)


###Тип строки - **blockList**

Список в блоке. 

*title* - Заголовок блока.

``` json
    {
      "type": "blockList",
      "title": "Итоги за день",
      "data": [
        "Энергозатраты: 80 ккал",
        "Количество повто......"
      ]

    }
```

![](http://storage-145851-1.cs.clodoserver.ru/test/blockList.png)


###Тип строки - **diaryExercise**

Упражнение в дневнике тренировок. 

*data.name* - Наименование упражнения.

*data.count* - Количество колонок.

*data.groups* - Группировка колонок. Не обязательный параметр. Если не передано, то колнкине группируются.

*data.outcomeSport* - Энергозатраты. Если не передано или равно 0, то не выводится.

*data.rows* - Строки описывающие упражнение.

``` json
    {
      "type": "diaryExercise",
     
      "data": {
        "name": "Разгибание рук в наклоне",
        "count": 10,
        "groups": [
          {"start": 1, "end": 3},
          {"start": 4, "end": 6},
          {"start": 7, "end": 8}
        ],
        "outcomeSport": 25,
        "rows": [
            {
            "title": "Количество повторений", 
            "values": [{"cell": 1, "value": "10"}], [{"cell": 4, "value": "9"}] 
            },
            
             {
            "title": "Вес снаяряда", 
            "values": [{"cell": 1, "value": "30"}], [{"cell": 4, "value": "30"}] 
            }
        ]
      }

    }
```

![](http://storage-145851-1.cs.clodoserver.ru/test/diaryExercise.png)





