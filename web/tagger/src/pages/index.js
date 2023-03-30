import {useState, useRef, useMemo, useEffect} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.scss'
import {classes, parseCsvFile} from '@/utils/utils'
const inter = Inter({ subsets: ['latin'] })
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
        <form method="post" encType="multipart/form-data">
          <div>
            <label htmlFor="file">Choose file to upload</label>
            <input 
              onChange={changeHandler}
              accept="text/txt"
              type="file" 
              id="file" 
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
        <form method="post" encType="multipart/form-data">
          <div>
            <label htmlFor="file">Choose csv to upload</label>
            <input 
              onChange={changeHandler}
              accept="text/csv"
              type="file" 
              id="file" 
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
        <form method="post" encType="multipart/form-data">
          <div>
            <label htmlFor="file">Choose json to upload</label>
            <input 
              onChange={changeHandler}
              accept="text/json"
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

  function getParagraphStyles(index) {
    if (index == selectedItemIndex) {
      return classes([styles.paragraph, styles.selected])
    } else {
      return classes([styles.paragraph, styles.unselected])          
    }
  }

  const memoizedItems = useMemo(() => {
    return content.map((item, index) => {
      return (<li key={index}>
                <p onClick={() => onItemClicked(index)}
                   className={getParagraphStyles(index)}>
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
      <ul>
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
    let hours = date.getHours()
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${hours}-${minute}-${day}-${month}-${year}`;
  }

  function exportJson() {
    const data = {}
    data.contentFilename = contentFilename
    data.domainsFilename = domainsFilename
    const date = getDateString()
    data.date = date
    data.domains = domains
    const d = content.reduce((acc, entry, index) => {
      let entry_tags = tags[index]
      if(entry_tags.length > 0) {
        let obj = {entry: entry, entryIndex: index, tags: entry_tags}
        acc.push(obj)
      }
      return acc
    }, [])
    data.data = d
    const jsonFilename = removeFileExtension(contentFilename) + "_" + date.replaceAll("-", "_") + "_tags" + ".json"
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
          for(let i = 0; i < json.data.length; i++) {
            const v = json.data[i]
            newState[v.entryIndex] = v.tags
          }
          return newState
        })
      }
  }
  function onListItemClicked(index) {
    setSelectedContentId(index)
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
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.col1}>
            <FormUploadContent onContentUploaded={onContentUploaded}/>
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
          <div className={styles.col2}>
            <FormUploadDomains onDomainsUploaded={onDomainsUploaded}/>
            {domains.length > 0 && (
              <ListDomainButtons domains={domains} 
                                 onDomainClicked={onDomainClicked}/>
            )}
          </div>
        </div>
        <footer className={styles.footer}>
          <button onClick={()=>exportJson()}> download </button>
          <FormUploadProject onProjectUploaded={onProjectUploaded}/>
        </footer>

      </main>
    </>
  )
}
