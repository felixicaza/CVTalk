import { useEffect, useState, useCallback } from "preact/hooks";
import isURL from "validator/lib/isURL";
import "./configurator.css";
import useSpeechSynthesis from "../../hooks/useSpeechSynthesis";

// config de twitch
const CHANNEL = "channel"; //text 👍

// estilos
const DEFAULT_AVATAR = "default_avatar"; //text URL
const STYLE = "style"; //text URL 👍
//posiblemente podría chequear que la URL es accesible

// funciones
const TTS = "tts"; // Checkbox (activo po defecto) 👍
// Los parámetros TTS deberían de ser obtenidos del navegador 👍
const TTS_ACCENT = "tts_accent"; // listado desplegable 👍
const TTS_INDEX = "tts_index"; // Listado desplegable (indices dependiendo del accento)
const RENDER = "render"; // checkbox (activo por defecto) 👍
const BOTS = "bots"; // Esto es un arreglo de strings 👍
const PATO_BOT = "pato_bot"; // bool (activo por defecto) 👍
const HTMLI = "htmli"; // 👍 Checkbox (desactivado y avisando que es experimental)
const VALID = "_valid";

const itemStyle = "m-1";
const labelStyle = "mr-2";
const input =
  "bg-zinc-950 text-zinc-100 border-b-2 border-zinc-300 focus:border-amber-300 transition-all";

const dataInitialState = {};
dataInitialState[CHANNEL] = "chrisvdev"; // Validar Usuario si
dataInitialState[DEFAULT_AVATAR] = ""; // URL si
dataInitialState[`${DEFAULT_AVATAR}${VALID}`] = true; // URL si
dataInitialState[STYLE] = ""; // Validar URL si
dataInitialState[`${STYLE}${VALID}`] = true; // Validar URL si
dataInitialState[TTS] = true; // check si
dataInitialState[TTS_ACCENT] = ""; // Auto
dataInitialState[TTS_INDEX] = ""; // Auto
dataInitialState[RENDER] = true; // check si
dataInitialState[BOTS] = ""; // Validar Usuario incluye si
dataInitialState[PATO_BOT] = true; // check si
dataInitialState[HTMLI] = false; // check si

const typeUser = [CHANNEL, BOTS];
const typeUsers = [BOTS];
const typeCheck = [TTS, RENDER, PATO_BOT, HTMLI];
const typeURL = [DEFAULT_AVATAR, STYLE];

/*
  Reemplazar onInput por onKeyDown
  Aparentemente desencadena un render pero precisa del preventDefault

  En el caso de tener muchos inputs hacer el renderizado dinámico en
  base a las constantes que se agreguen 
*/

export default function Configurator() {
  const voices = useSpeechSynthesis();
  const [data, setData] = useState(structuredClone(dataInitialState));
  const makeInputHandler = useCallback((key) => {
    const validUser = /^[A-Za-z0-9_]*$/;
    const validUsers = /^[A-Za-z0-9_,]*$/;
    const updateState = (value, altKey) => {
      setData((lastState) => {
        const newState = { ...lastState };
        newState[altKey || key] = value;
        return newState;
      });
    };
    const refreshState = () => {
      setData((lastState) => structuredClone(lastState));
    };
    if (typeUser.includes(key))
      return (e) => {
        const { value } = e.currentTarget;
        if (
          typeUsers.includes(key)
            ? validUsers.test(value)
            : validUser.test(value)
        )
          updateState(value);
        else refreshState();
      };
    if (typeCheck.includes(key))
      return (e) => {
        const { checked } = e.currentTarget;
        if (typeof checked === "boolean") updateState(checked);
        else refreshState();
      };
    if (typeURL.includes(key))
      return (e) => {
        const { value } = e.currentTarget;
        updateState(value);
        updateState(value === "" || isURL(value), `${key}${VALID}`);
      };
    return (e) => {
      const { value } = e.currentTarget;
      updateState(value);
    };
  }, []);
  useEffect(() => {
    const onEvent = () => {
      setData((initialData) => {
        const data = { ...initialData };
        data[TTS_ACCENT] = speechSynthesis.getVoices()[0].lang;
        data[TTS_INDEX] = 1;
        return data;
      });
    };
    speechSynthesis.addEventListener("voiceschanged", onEvent);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", onEvent);
    };
  }, []);
  const renderVoicesIndexes = (quantity) => {
    const options = [];
    for (let i = 1; i <= quantity; i++) {
      options.push(<option>{i}</option>);
    }
    return options;
  };
  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <section className="mx-auto max-w-md">
      <form>
        <div className={itemStyle}>
          <label className={labelStyle}>Channel</label>
          <input
            className={input}
            value={data[CHANNEL]}
            type="text"
            name={CHANNEL}
            onInput={makeInputHandler(CHANNEL)}
          />
        </div>
        <div className={itemStyle}>
          <label className={labelStyle}>Custom CSS Style</label>
          <input
            className={input}
            value={data[STYLE]}
            type="text"
            name={STYLE}
            onInput={makeInputHandler(STYLE)}
          />
        </div>
        {data[`${STYLE}${VALID}`] || <p>Is not a valid URL</p>}
        <div className={itemStyle}>
          <label className={labelStyle}>Default Avatar</label>
          <input
            className={input}
            value={data[DEFAULT_AVATAR]}
            type="text"
            name={DEFAULT_AVATAR}
            onInput={makeInputHandler(DEFAULT_AVATAR)}
          />
        </div>
        {data[`${DEFAULT_AVATAR}${VALID}`] || <p>Is not a valid URL</p>}
        <div className={itemStyle}>
          <label className={labelStyle}>TTS</label>
          <input
            checked={data[TTS]}
            type="checkbox"
            name={TTS}
            onInput={makeInputHandler(TTS)}
          />
        </div>
        <div className={itemStyle}>
          {/* Si esta desactivado se podrían anular los 2 siguientes inputs */}
          <label className={labelStyle}>TTS Accent</label>
          <select
            className={input}
            value={data[TTS_ACCENT]}
            name={TTS_ACCENT}
            onInput={makeInputHandler(TTS_ACCENT)}
          >
            {Object.keys(voices)
              .sort()
              .map((voice, i) => (
                <option key={`voice_${i}`}>{voice}</option>
              ))}
          </select>
        </div>
        <div className={itemStyle}>
          <label className={labelStyle}>Accent variant</label>
          <select
            className={input}
            value={data[TTS_INDEX]}
            name={TTS_INDEX}
            onInput={makeInputHandler(TTS_INDEX)}
          >
            {data[TTS_ACCENT] !== "" &&
              renderVoicesIndexes(voices[data[TTS_ACCENT]])}
          </select>
        </div>
        <div className={itemStyle}>
          <label className={labelStyle}>Render</label>
          <input
            checked={data[RENDER]}
            type="checkbox"
            name={RENDER}
            onInput={makeInputHandler(RENDER)}
          />
        </div>
        <div className={itemStyle}>
          <label className={labelStyle}>Bots</label>
          <input
            className={input}
            value={data[BOTS]}
            type="text"
            name={BOTS}
            onInput={makeInputHandler(BOTS)}
          />
          <p className="font-mono text-xs m-1">
            Usernames separated by "," like "bot1,bot2,etc"
          </p>
        </div>
        <div className={itemStyle}>
          <label className={labelStyle}>PatoBot compatibility</label>
          <input
            type="checkbox"
            checked={data[PATO_BOT]}
            name={PATO_BOT}
            onInput={makeInputHandler(PATO_BOT)}
          />
          <p>
            (
            <a href="https://elpatobot.com/">
              You need to have the PatoBot configured.
            </a>
            )
          </p>
        </div>
        <div className={itemStyle}>
          <label className={labelStyle}>HTML Injection</label>
          <input
            type="checkbox"
            checked={data[HTMLI]}
            name={HTMLI}
            onInput={makeInputHandler(HTMLI)}
          />
          <p>(Experimental, Use on your own risk)</p>
        </div>
      </form>
    </section>
  );
}