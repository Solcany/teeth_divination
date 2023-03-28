import {useState} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.scss'
import {classes, parseCsvFile} from '@/utils/utils'
const inter = Inter({ subsets: ['latin'] })
const FORMATTER = '\n\n'



export default function Home() {
  const [contentFilename, setContentFilename] = useState("")
  const [domainsFilename, setDomainsFilename] = useState("")
  const [content, setContent] = useState([])
  const [tags, setTags] = useState([])
  const [selectedContentId, setSelectedContentId] = useState(-1)
  const [domains, setDomains] = useState([])

  function FormUploadContent() {
    function changeHandler(e) {
      if(e.target.files.length > 0) {
        const reader = new FileReader()
        setContentFilename(e.target.files[0].name)
        reader.readAsText(e.target.files[0])
        reader.onload = function(e) {
            const raw = reader.result;
            const formatted = raw.split(FORMATTER)
            setContent(formatted)
            setTags(new Array(formatted.length).fill([]))
        };
      }
    }
    return (
          <form method="post" encType="multipart/form-data">
            <div>
              <label htmlFor="file">Choose file to upload</label>
              <input 
                onChange={changeHandler}
                accept="text/*"
                type="file" 
                id="file" 
                name="file"/>
            </div>
          </form>
    )
  }

  function FormUploadDomains() {
    function changeHandler(e) {
      if(e.target.files.length > 0) {
        const reader = new FileReader();
        setDomainsFilename(e.target.files[0].name)
        reader.readAsText(e.target.files[0]);
        reader.onload = function(e) {
          const rows = parseCsvFile(e.target.result)
          let domains = rows.map((row) => row.Domain)
          domains = domains.filter((domain) => domain !== "")
          setDomains(domains)
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

  function Paragraph({isSelected, onClick, children}) {
    function getStyles() {
      if (isSelected) {
        return classes([styles.paragraph, styles.selected])
      } else {
        return classes([styles.paragraph, styles.unselected])          
      }
    }
    return (
      <p onClick={onClick} className={getStyles()}>
        {children}
      </p>
    )
  }

  function ListContent() {
    function handleParagraphClick(index) {
      // selects the paragraph when clicked 
      setSelectedContentId(index)
    }
    function handleTagClick(index, tag) {
      // deletes the tag when clicked
     setTags(prevState => {
        let newState = [...prevState]
        newState[index] = newState[index].filter((t) => t !== tag);
        return newState;
      });   
    }

    return (
      <ul>
          {
            content.map((entry, index) => {
              return (<li key={index}>
                        <Paragraph 
                          index={index}
                          onClick={() => handleParagraphClick(index)}
                          isSelected={index === selectedContentId}>
                          {entry}
                        </Paragraph>
                        {tags[index].length > 0 && (
                          tags[index].map((tag, index)=> {
                            return (
                                <button key={index} onClick={()=> handleTagClick(index, tag)}>
                                  {tag}
                                </button>
                            )
                          })
                        )}
                      </li>
                      )
            })
          } 
      </ul>
    )
  }

  function ListDomainButtons() {
    function handleClick(domain) {
      // add domains to the selected paragraph
      if (selectedContentId > -1) {
         setTags(prevState => {
            const newState = [...prevState]
            newState[selectedContentId] = [...newState[selectedContentId], domain]
            return newState;
          });
      }      
    }
    return (
      <ul>
        {
          domains.map((domain, index) => {
            return (
              <li key={index} >
                <button onClick={()=> handleClick(domain)}>{domain}</button>  
              </li>                

            )
          })
        }
      </ul>
    )
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

    // Clean up the URL object
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

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
      <button onClick={()=>exportJson()}> download </button>
      <FormUploadContent/>
      <FormUploadDomains/>
        <div>
        {domains.length > 0 && (
          <ListDomainButtons/>
          )}
        </div>

        <div>
        {content.length > 0 && (
          <ListContent/>
        )}
        </div>
      </main>
    </>
  )
}
