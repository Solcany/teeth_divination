import {useState, useRef, useMemo, useEffect} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.scss'
import {classes, parseCsvFile} from '@/utils/utils'
import localFont from 'next/font/local'
const font = localFont({ src: '../../public/fonts/lato-regular-webfont.woff2',
                        variable: '--lato-regular'})
const FORMATTER = '\n\n'



function FormUploadContent({onContentUploaded}) {
  function changeHandler(e) {
    if(e.target.files.length > 0) {
      const reader = new FileReader()
      const filename = e.target.files[0].name
      reader.readAsText(e.target.files[0])
      reader.onload = function(e) {
          const raw = reader.result;
          const data = raw.split(FORMATTER)
          onContentUploaded([filename, data])
      };
    }
  }
  return (
        <form className={styles.form} method="post" encType="multipart/form-data">
          <div className={styles.container}>
            <label className={styles.label} 
                   htmlFor="file">Upload a text document (.txt)</label>
            <input 
              onChange={changeHandler}
              className={styles.input}
              accept=".txt"
              type="file" 
              name="file"/>
          </div>
        </form>
  )
}

function FormUploadDomains({onDomainsUploaded}) {
  function changeHandler(e) {
    if(e.target.files.length > 0) {
      const reader = new FileReader();
      const filename = e.target.files[0].name
      reader.readAsText(e.target.files[0]);
      reader.onload = function(e) {
        const rows = parseCsvFile(e.target.result)
        let domains = rows.map((row) => row.Domain)
        domains = domains.filter((domain) => domain !== "")
        onDomainsUploaded([filename, domains])
      }
    }
  }
  return (
        <form className={classes([styles.form, styles.formDomains])} method="post" encType="multipart/form-data">
          <div className={styles.container}>
            <label className={styles.label} 
                   htmlFor="file">Upload domains (.csv)</label>
            <input 
              onChange={changeHandler}
              className={styles.input}              
              accept=".csv"
              type="file" 
              name="file"/>
          </div>
        </form>
  )
}

function FormUploadProject({onProjectUploaded}) { 
  function changeHandler(e) {
    if(e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsText(e.target.files[0]);
      reader.onload = function(e) {
        const json = JSON.parse(e.target.result)
        onProjectUploaded(json.data)
      }
    }
  }
  return (
        <form className={styles.form} method="post" encType="multipart/form-data">
          <div className={styles.container}>
            <label className={styles.label}  
                   htmlFor="file">Upload project (.json)</label>
            <input 
              onChange={changeHandler}
              className={styles.input}
              accept=".json"
              type="file" 
              id="file" 
              name="file"/>
          </div>
        </form>
  )
}  

function ListContent({selectedItemIndex,
                      onItemClicked,
                      onTagClicked,
                      tags,
                      content}) {

  function getStyles(index) {
    if (index == selectedItemIndex) {
      return classes([styles.selected])
    } else {
      return classes([styles.unselected])          
    }
  }

  const memoizedItems = useMemo(() => {
    return content.map((item, index) => {
      return (<li key={index} className={getStyles(index)}>
                <p onClick={() => onItemClicked(index)}
                   className={styles.paragraph}>
                  {item}
                </p>                    
                {tags[index].length > 0 && (
                  tags[index].map((tag, tIndex)=> {
                    return (
                        <button key={tIndex} onClick={()=> onTagClicked(tag, index)}>
                          {tag}
                        </button>
                    )
                  })
                )}
              </li>
              )
    });
  }, [content, tags, selectedItemIndex]);

  return (
    <ul className={styles.listText}>
        {memoizedItems} 
    </ul>
  )
}

  function ListDomainButtons({domains, onDomainClicked}) {
    return (
      <ul className={styles.list_domains}>
        {
          domains.map((domain, index) => {
            return (
              <li key={index} >
                <button onClick={()=> onDomainClicked(domain)}>{domain}</button>  
              </li>                

            )
          })
        }      
      </ul>
    )
  }


export default function Home() {
  const [contentFilename, setContentFilename] = useState("")
  const [domainsFilename, setDomainsFilename] = useState("")
  const [content, setContent] = useState([])
  const [tags, setTags] = useState([])
  const [selectedContentId, setSelectedContentId] = useState(-1)
  const [domains, setDomains] = useState([])


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

  function removeFileExtension(string) {
    return string.replace(/\.[^/.]+$/, "");
  }

  function getDateString() {
    const date = new Date();
    let minute = date.getMinutes();
    let seconds = date.getSeconds();    
    let hours = date.getHours()
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${hours}-${minute}-${seconds}-${day}-${month}-${year}`;
  }

  function exportJson() {
    const data = {}
    data.contentFilename = contentFilename
    data.domainsFilename = domainsFilename
    const date = getDateString()
    data.date = date
    data.domains = domains
    const d = content.reduce((acc, entry, index) => {
      let entry_domains = tags[index]
      if(entry_domains.length > 0) {
        let obj = {entry: entry, entryIndex: index, domains: entry_domains}
        acc.push(obj)
      }
      return acc
    }, [])
    data.data = d
    const jsonFilename = "BOMTYCC_" + removeFileExtension(contentFilename) + "_" + date.replaceAll("-", "_") + ".json"
    downloadJson(data, jsonFilename)
  }

  function onContentUploaded(data) {
    const[filename, content] = data 
    setContentFilename(filename)
    setContent(content)
    setTags(new Array(content.length).fill([]))
  }

  function onDomainsUploaded(data) {
        const[filename, domains] = data 
        setDomainsFilename(filename)
        setDomains(domains)
  }

  function onProjectUploaded(data) {
    // set tags from json to the current tags
      if(data && data.length > 0) {
        setTags((prevState)=> {
          let newState = [...prevState]
          for(let i = 0; i < data.length; i++) {
            const v = data[i]
            newState[v.entryIndex] = v.domains
          }
          return newState
        })
      }
  }
  function onListItemClicked(index) {
    setSelectedContentId((prevState) => {
      if(prevState === index) {
        return -1
      } else {
        return index
      }
    })
  }
  function onTagClicked(tag, index) {
     // deletes the tag when clicked
     setTags(prevState => {
        let newState = [...prevState]
        newState[index] = newState[index].filter((t) => t !== tag);
        return newState;
      });   
  }

  function onDomainClicked(domain) {
    if(selectedContentId > -1) {
       setTags(prevState => {
          // dont add the domain if the paragraph already has it
          const hasDomainAlready = prevState[selectedContentId].indexOf(domain) > -1
          if(hasDomainAlready) {
            return prevState
          } else {
            const newState = [...prevState]
            newState[selectedContentId] = [...newState[selectedContentId], domain]
            return newState;
          }
        });
    }    
  }

  return (
    <>
      <Head>
        <title>BOMTYCC tagger</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={classes([styles.main, font.variable])}>
        <div className={styles.content}>
          <div className={styles.col2}>
            <FormUploadDomains onDomainsUploaded={onDomainsUploaded}/>
            {domains.length > 0 && (
              <ListDomainButtons domains={domains} 
                                 onDomainClicked={onDomainClicked}/>
            )}
          </div>
          <div className={styles.col1}>
            <div className={styles.forms}>
              <FormUploadContent onContentUploaded={onContentUploaded}/>
              <FormUploadProject onProjectUploaded={onProjectUploaded}/>
            </div>
            <div className={styles.listTextContainer}>
              {content.length > 0 && (
                <ListContent content={content}
                             tags={tags}
                             selectedItemIndex={selectedContentId}
                             onItemClicked={onListItemClicked}
                             onTagClicked={onTagClicked} />
              )}  
            </div>
          </div>

        </div>
        <footer className={styles.footer}>
          <button onClick={()=>exportJson()}> download project </button>
        </footer>

      </main>
    </>
  )
}
