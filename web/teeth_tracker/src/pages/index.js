// D key, next image
// A key, prev image
// W key, next tooth
// S key, prev tooth    
// U key, last vertex

import {useState, useRef, useMemo, useEffect} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.scss'
import {classes, parseCsvFile} from '@/utils/utils'
import localFont from 'next/font/local'
const font = localFont({ src: '../../public/fonts/lato-regular-webfont.woff2',
                        variable: '--lato-regular'})

const TEETH_ORIENTATION = "up"
// teeth meridian read left to right
const TEETH_UP_MERIDIAN = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24 ,25, 26, 27, 28]
const TEETH_DOWN_MERIDIAN = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const IMGS_FOLDER = TEETH_ORIENTATION == "up" ? "images/teeth_up/" : "images/teeth_down/";
const THE_MERIDIAN = TEETH_ORIENTATION == "up" ? TEETH_UP_MERIDIAN : TEETH_DOWN_MERIDIAN;
const WIDTH = 3000;
const HEIGHT = 3000;
const IMG_FIRST_IDX = 3;
const IMG_LAST_IDX = 45;
const IMGS_TOTAL = IMG_LAST_IDX - IMG_FIRST_IDX;
const IMGS_PATHS = range(IMGS_TOTAL+1, IMG_FIRST_IDX).map((v) => {
  return IMGS_FOLDER + v.toString().padStart(3, '0') + ".png"
})

// utils 
function getDateString(divider="-") {
  const date = new Date();
  let minute = date.getMinutes();
  let seconds = date.getSeconds();    
  let hours = date.getHours()
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  return `${hours}${divider}${minute}${divider}${seconds}${divider}${day}${divider}${month}${divider}${year}`;
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

function FormUploadProject({onProjectUploaded}) { 
  function changeHandler(e) {
    if(e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsText(e.target.files[0]);
      reader.onload = function(e) {
        const json = JSON.parse(e.target.result)
        onProjectUploaded(json)
      }
    }
  }
  return (
        <form method="post" encType="multipart/form-data">
            <label htmlFor="file">Upload .json</label>
            <input 
              onChange={changeHandler}
              accept=".json"
              type="file" 
              id="file" 
              name="file"/>
        </form>
  )
}  

export default function Home() {
  const [currentBrace, setCurrentBrace] = useState(0)
  const [currentToothIndex, setCurrentToothIndex] = useState(0)
  const [data, setData] = useState(initData())
  const canvasRef = useRef(null)

  function initData() {
    return THE_MERIDIAN.map((v)=> {
      return { toothId: v, 
               toothPositions: []}
    })
  }
  function handleCanvasClick(event) {
        var x = event.clientX + document.documentElement.scrollLeft;
        var y = event.clientY + document.documentElement.scrollTop;

        setData(prevState => {
          // don't add new vertices if last brace is reached
          if(currentBrace === IMGS_TOTAL-1) {
            return prevState;
          } else {
            let newState = [...prevState];
            newState[currentToothIndex].toothPositions = [...newState[currentToothIndex].toothPositions, [x,y]];
            return newState;
          }
        })

        setCurrentBrace(prevState => {
          // restrict current brace 
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
            if(prevState === THE_MERIDIAN.length-1) {
              return 0
            } else  {
              return prevState + 1
            }          
          })
      // down key, prev tooth    
      } else if (event.key === "s") {
          setCurrentToothIndex(prevState => {
            if(prevState === 0) {
              return THE_MERIDIAN.length-1
            } else  {
              return prevState - 1
            }          
          })
      // delete last vertex
      } else if (event.key === "u") {
        setData(prevState => {
            let newState = [...prevState];
            newState[currentToothIndex].toothPositions = newState[currentToothIndex].toothPositions.slice(0, -1);
            return newState;
        })
        // return to previous brace image
        setCurrentBrace(prevState => {
          if(prevState === 0) {
            return prevState
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
    // canvas settings
    let ctx = canvasRef.current.getContext("2d")
    if(ctx) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 0.5;
    }
  }, [canvasRef])  

  useEffect(()=> {
    if(canvasRef.current) {
      let ctx = canvasRef.current.getContext("2d")
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // Draw the line on the canvas
      ctx.beginPath();
      let d = data[currentToothIndex].toothPositions;
      console.log(d)
      for(let i = 0; i < d.length - 1; i++) {
        const [startX, startY] = d[i];
        const [endX, endY] = d[i+1];
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);        

      }
      ctx.stroke();
    }
  }, [data, currentToothIndex])

  function getExportJson() {
    let json = {}
    json.canvasWidth = WIDTH
    json.canvasHeight = HEIGHT
    json.teethDirection = TEETH_ORIENTATION
    json.data = [...data]
    return json
  }

  function normaliseTeethPositions() {
    // wip
  }

  function handleDownloadButtonClick() {
    console.log(data)
    const json = getExportJson()
    const filename = "BOMTYCC_teeth_" + TEETH_ORIENTATION + "_" + getDateString("") + ".json"
    downloadJson(json, filename)    
  }

  function handleProjectUploaded(projectData) {
    if(projectData.data && projectData.data.length > 0) {
      setData(projectData.data)
    }
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
          brace num: {currentBrace}
          <br/>
          <button onClick={handleDownloadButtonClick}>download</button>
          <FormUploadProject onProjectUploaded={handleProjectUploaded}/>
        </div>
        <canvas onClick={(e) => handleCanvasClick(e)}
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
