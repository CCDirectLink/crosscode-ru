# <img src="icon48.png" alt="icon48.png" style="vertical-align: text-bottom;"> crosscode-ru

Комьюнити-модпак русского перевода игры [CrossCode](https://cross-code.com/en/home), который мы все
заслужили.

**Наш веб-сайт**: https://crosscode.ru/ \
**Наш Discord-сервер**: https://crosscode.ru/discord (https://discord.com/invite/QANXNbR) \
**Наша группа в VK**: https://vk.com/crusscode

[**Перейти к инструкции по установке!**](#инструкции-по-установке)

[**Перейти к инструкции по обновлению!**](#инструкции-по-обновлению)

![community translation official response 1](docs/media/community-translation-official-response1.png)

![community translation official response 2](docs/media/community-translation-official-response2.png)

## Важная заметка о сообществе

Discord-сервер русского сообщества нынче заархивирован и заморожен. Другими словами, туда нельзя
ничего писать, а сам он является музеем. Но команда переводчиков создала новый сервер, не связанный
с тематикой CrossCode, зайти на него можно по ссылке:

https://discord.gg/P9hKbZkYym

Тем не менее, поддержка мода не заканчивается, об этом можно прочитать в
[заметках к релизу 1.2.3](https://github.com/CCDirectLink/crosscode-ru/releases/tag/v1.2.3). Насчёт
возможного перевода будущих проектов [RadicalFishGames](http://www.radicalfishgames.com/?page_id=17)
читайте в
[заметках к релизу 1.2.0](https://github.com/CCDirectLink/crosscode-ru/releases/tag/v1.2.0).

## Фичи

### 1. Собственно, русский перевод CrossCode

![translated story 1](docs/media/screenshots/features/translated-story1.gif)

![translated story 1](docs/media/screenshots/features/translated-story1.png)

![translated story 2](docs/media/screenshots/features/translated-story2.png)

![translated interface](docs/media/screenshots/features/translated-interface.png)

### 2. Куча различных исправлений интерфейса

**Например, бегущие строки:**

![ticker display](docs/media/screenshots/features/ticker-display.gif)

Или, вот ещё один пример. **Оригинал:**

![ui fix example before](docs/media/screenshots/features/ui-fix-example-before.png)

(простите, в этот раз без гифки) **С фиксом для бегущих строк:**

![ui fix example after](docs/media/screenshots/features/ui-fix-example-after.png)

### 3. Опциональная локализация текстур

![localized sprites](docs/media/screenshots/features/optional-localized-sprites.png)

### 4. Улучшенная карта мира

![world map overhaul](docs/media/screenshots/features/cc-world-map-overhaul.png)

## Инструкции по установке

Обновляетесь на новую версию? Сначала просмотрите
[инструкции по обновлению](#инструкции-по-обновлению).

### Шаг 1. Определите путь к папке игры

Путь может отличаться в зависимости от операционной системы и метода установки игры. Папка игры
выглядит следующим образом:

**MS Windows:**

![game directory contents on MS Windows](docs/media/screenshots/game-directory-contents_windows.ru_RU.png)

**macOS:**

![game directory contents on macOS](docs/media/screenshots/game-directory-contents_macos.ru_RU.png)

**GNU/Linux:**

![game directory contents on Linux](docs/media/screenshots/game-directory-contents_linux.ru_RU.png)

#### Steam

Для определения пути можно воспользоваться встроенным меню "локальные файлы" в свойствах игры:

![browse local files](docs/media/screenshots/steam-browse-local-files.ru_RU.png)

Обычно папка, в которую Steam устанавливает игру, расположена в:

- **MS Windows**: `C:\Program Files\Steam\steamapps\common\CrossCode`
- **macOS:** `~/Library/Application Support/Steam/steamapps/common/CrossCode`
- **GNU/Linux:** `~/.local/share/Steam/steamapps/common/CrossCode`

##### Заметка пользователям macOS

На macOS папка игры расположена внутри установленного приложения. Для перехода в неё надо сделать
следующее:

1. После открытия через Steam папки с локальными файлами игры, нажмите правой кнопкой мыши на
   приложение `nwjs` или `CrossCode`
2. Выберите в контекстном меню пункт "Показать содержимое пакета"
   ![mac screenshot show package contents](docs/media/screenshots/mac_show-package-contents.ru_RU.png)
3. Перейдите в папку `Contents`, затем в `Resources`
4. Папка игры находится в `app.nw`
   ![mac screenshot app.nw](docs/media/screenshots/mac_game-directory-path.png)

#### Для пиратов

Раз уж Вы решили пойти по благородному пути пиратства, то, думаю, Вы знаете, чем занимаетесь, ну и
где лежит папка игры тоже.

### Шаг 2. Скачивание модпака

<big><strong>ВНИМАНИЕ!!! Пожалуйста, внимательно читайте, что и куда надо скачивать!</strong></big>

Перейдите на страницу
[последнего релиза](https://github.com/CCDirectLink/crosscode-ru/releases/latest) и скачайте архив с
именем `crosscode-ru_quick-install_vX.Y.Z.zip` (или `crosscode-ru_quick-install_vX.Y.Z.tgz` если вам
не нравится `.zip`). **Обратите внимание на приписку `quick-install` в названии!** Этот архив уже
содержит все моды из русского модпака плюс загрузчик модов
[CCLoader](https://github.com/CCDirectLink/CCLoader).

### Шаг 3. Установка модпака

Распакуйте файлы из архива прямо в папку игры:

![unpack copy files](docs/media/screenshots/unpack_drag.ru_RU.png)

Замены требует только один файл - `package.json`:

![unpack replace package.json](docs/media/screenshots/unpack_replace.ru_RU.png)

### Шаг 4. Первый запуск игры

После запуска игры перейдите в меню "Options". Если вы всё сделали правильно - в опции выбора языка
(вкладка "General") появится пункт "Russian":

![options menu](docs/media/screenshots/options-language.en_US.png)

**ВНИМАНИЕ!!! После выбора "Russian" перезапустите игру!!!**

### Шаг 5. Второй запуск игры и выбор опций мода

![go already animation](docs/media/go_already.gif)

Теперь изменения языка игры применены. Вы также можете изменить несколько дополнительных опций,
которые, собственно, добавляет мод перевода:

![options menu russian](docs/media/screenshots/options-general.ru_RU.png)

- **Локализация текстур** - Включает переведённые надписи на спрайтах, например, на табличках в
  игровом мире. Включена по-умолчанию.
- **Перевод имени "Lea"** - _Лея:_ Более естественно звучащий вариант. _Лиа:_ Сохраняет каноническое
  произношение. Данная опция призвана разрешить древний холивар двух враждующих групп переводчиков.
  Тем не менее, по-умолчанию выбран вариант _"Лея"_.

**ВНИМАНИЕ!** Изменение любой из этих двух опций требует перезапуска игры!

Также стоит упомянуть, какие моды включены в состав модпака. Вы можете включать и выключать
установленные моды в меню "Моды", при свежей установке модпака crosscode-ru это меню будет выглядеть
так:

![options mods russian](docs/media/screenshots/options-mods.ru_RU.png)

Краткие описания функционала каждого мода:

- **crosscode-ru** _(не выключать!)_ - Русский перевод CrossCode собственной персоной, главный мод в
  модпаке, содержит файлы (пакеты) с переводами строк и исправления интерфейса _специфичные_ для
  русского языка.
- **Ultimate Localized UI** _(не выключать!)_ - Общие улучшения и исправления интерфейса
  пользователя, разработан и _требуется_ для crosscode-ru, но теперь используется также и в других
  проектах перевода CrossCode.
- [**Localize Me**](https://github.com/L-Sherry/Localize-me#readme) _(не выключать!)_ - Мод для
  добавления новых языков в игру, внедрения переводов и изменения прочих региональных настроек,
  просто _необходим_ для работы crosscode-ru.
- [**World map overhaul**](https://github.com/dmitmel/cc-world-map-overhaul#readme)
  _(опционально)_ - Улучшенная карта мира, нарисована очень-очень давно одним из ключевых членов
  команды переводчиков.

**ВНИМАНИЕ!** Думаю, что это уже стало очевидным, но после включения или выключения модов требуется
перезапуск игры!

### Шаг 6. Удачи и приятной игры!

![new game](docs/media/screenshots/new-game.ru_RU.png)

## Инструкции по обновлению

В принципе, вы можете просто повторить все шаги в
[инструкции по установке](#инструкции-по-установке) и при распаковке архива перезаписать все
установленные файлы. Но всё же, я рекомендую для начала удалить следующие папки в папке игры (папки
отмечены `/` в конце):

```
<папка игры>/
├─ assets/
│  └─ mods/
│     ├─ cc-world-map-overhaul/
│     ├─ crosscode-ru/
│     ├─ enhanced-ui/
│     └─ Localize-me/
└─ ccloader/
```

После чего можете спокойно выполнять установку [начиная с шага 2](#шаг-2-скачивание-модпака).

## Авторы

### Генеральный сборщик

- Dimava

### Программисты мода

- dmitmel
- L-Sherry

### Главный редактор

- Packy

### Редакторы

- Sandorik
- Mystical Kitsune

### Тостеры (тестировщики)

- ElectroPlayer
- Sage the Voity

### Переводчики

- Packy
- Mystical Kitsune
- Sandorik
- dymeon
- MegaGazon
- Dimava
- Dustex
- Rik'Zun
- Death_Gun
- RarityDash
- Sage the Voity
- ArgonLain
- DeSio
- Cilez
- aspadm
- ArchonT3
- MystAxe

### Главный корректор

- dymeon

### Корректоры

- Varenik1226
- Щепыч

### Благодарности

- MrSuperParadox
- Yen
- Настечка
- MystAxe
- WatDuhHekBro
- Notabenoid

## Разные вопросы о легальности

Команда crosscode-ru никак не связана с
[RadicalFishGames](http://www.radicalfishgames.com/?page_id=17). Разрешение на распространение
модпака в таком виде, в котором он сейчас есть, было получено
([ссылка 1](https://discordapp.com/channels/143364538958348288/276459212807340034/676870708613087272),
[ссылка 2](https://discordapp.com/channels/143364538958348288/276459212807340034/676891793417306132)).
Переводы и изображения (ассеты) распространяются под лицензией
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). Код из
[этого репозитория](https://github.com/CCDirectLink/crosscode-ru) распространяется под лицензией
[MIT](https://choosealicense.com/licenses/mit/).
