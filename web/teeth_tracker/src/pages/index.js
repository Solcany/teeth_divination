import {useState, useRef, useMemo, useEffect} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.scss'
import {classes, parseCsvFile} from '@/utils/utils'
import localFont from 'next/font/local'
const font = localFont({ src: '../../public/fonts/lato-regular-webfont.woff2',
                        variable: '--lato-regular'})

const IMGS_FOLDER = "images/teeth1/";
const IMG_FIRST_IDX = 3;
const IMG_LAST_IDX = 45;
const IMGS_TOTAL = IMG_LAST_IDX - IMG_FIRST_IDX;
const TOOTH_FIRST = 1;
const TOOTH_LAST = 10;
const TEETH_TOTAL = TOOTH_LAST - TOOTH_FIRST;
const TEETH_DIR = "up"
// left to right
const TEETH_UP_MERIDIAN = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24 ,25, 26, 27, 28]
const TEETH_LOW_MERIDIAN = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] 
const WIDTH = 2000;
const HEIGHT = 2000;
const IMGS_PATHS = range(IMGS_TOTAL+1, IMG_FIRST_IDX).map((v) => {
  return IMGS_FOLDER + v.toString().padStart(3, '0') + ".png"
})

function getDateString() {
  const date = new Date();
  let minute = date.getMinutes();
  let seconds = date.getSeconds();    
  let hours = date.getHours()
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  return `${hours}${minute}${seconds}${day}${month}${year}`;
}

function downloadJson(object, filename) {
  const json = JSON.stringify(object, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

export default function Home() {
  const [currentBrace, setCurrentBrace] = useState(0)
  const [data, setData] = useState(initData())
  const [currentToothIndex, setCurrentToothIndex] = useState(0)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const [canvasCtx, setCanvasCtx] = useState(null)

  function initData() {
    let meridian = TEETH_DIR === "up" ? TEETH_UP_MERIDIAN : TEETH_LOW_MERIDIAN
    return meridian.map((v)=> {
      return { toothId: v, 
               toothPositions: []}
    })
  }
  function handleCanvasClick(event) {
        var x = event.clientX - canvasRef.current.offsetLeft;
        var y = event.clientY - canvasRef.current.offsetTop;

        setData(prevState => {
          let newState = [...prevState];
          newState[currentToothIndex].toothPositions = [...newState[currentToothIndex].toothPositions, [x,y]];
          return newState;
        })
        setCurrentBrace(prevState => {
          if(prevState === IMGS_TOTAL-1) {
            return prevState
          } else  {
            return prevState + 1
          }
        })
    }

  useEffect(() => {
    const handleKeyPress = (event) => {
      // right key, next image
      if (event.key === "d") {
        setCurrentBrace(prevState => {
          if(prevState === IMGS_TOTAL-1) {
            return 0
          } else  {
            return prevState + 1
          }
        })
      }
      // left key, prev image
      else if (event.key === "a") {
        setCurrentBrace(prevState => {
          if(prevState === 0) {
            return IMGS_TOTAL-1
          } else  {
            return prevState - 1
          }
        })
      // up key, next tooth
      } else if (event.key === "w") {
          setCurrentToothIndex(prevState => {
            if(prevState === TEETH_TOTAL) {
              return 0
            } else  {
              return prevState + 1
            }          
          })
      // down key, prev tooth    
      } else if (event.key === "s") {
          setCurrentToothIndex(prevState => {
            if(prevState === 0) {
              return TEETH_TOTAL-1
            } else  {
              return prevState - 1
            }          
          })
      };
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(()=> {
    if(canvasRef.current) {
      setCanvasCtx(canvasRef.current.getContext("2d"))
    }
  }, [])

  useEffect(()=> {
    if(canvasCtx) {
      canvasCtx.strokeStyle = "#000000";
      canvasCtx.lineWidth = 2;
    }
  }, [canvasCtx])  

  useEffect(()=> {
    if(canvasRef.current && data[currentToothIndex].toothPositions.length > 1) {
      // Draw the line on the canvas
      canvasCtx.beginPath();
      let d = data[currentToothIndex].toothPositions;
      for(let i = 0; i < d.length - 1; i++) {
        const [startX, startY] = d[i];
        const [endX, endY] = d[i+1];
        canvasCtx.moveTo(startX, startY);
        canvasCtx.lineTo(endX, endY);        

      }
      canvasCtx.stroke();
    }
  }, [data])

  function getExportJson() {
    let json = {}
    json.canvasWidth = WIDTH
    json.canvasHeight = HEIGHT
    json.teethDirection = TEETH_DIR
    json.data = [...data]
    return json
  }

  function normaliseTeethPositions() {
    // wip
  }

  function handleDownloadButtonClick() {
    const json = getExportJson()
    const filename = "BOMTYCC_teeth_" + getDateString() + ".json"
    downloadJson(json, filename)    
  }

  return (
    <>
      <Head>
        <title>teeth tracker</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={classes([styles.main, font.variable])}>
        <div className={styles.hud}>
          tooth num: {data[currentToothIndex].toothId}
          <br/>
          brace num: {data[currentToothIndex].toothId}
          <br/>
          <button onClick={handleDownloadButtonClick}>download</button>
        </div>
        <canvas onMouseDown={(e) => handleCanvasClick(e)}
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                className={styles.canvas}/>
        <div className={styles.imgContainer}>
          <img src={IMGS_PATHS[currentBrace]}
               style={{width: WIDTH + "px", height: HEIGHT + "px"}}/>
        </div>
        <span>{currentBrace+1}/{IMGS_TOTAL}</span>

      </main>
    </>
  )
}
