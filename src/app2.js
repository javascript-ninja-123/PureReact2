

const importThis = (() => {
    


    const render = (element,parentDom, oldDom = parentDom.firstChild) => {
        diff(element,parentDom, oldDom)
    }
  
    const diff = (vdom, parentDom,oldDom) => {
        const {type, props,children} = vdom;
        const Dom = document.createElement(type);
        const Props = props || {}
        //first rendering
        if(!oldDom){
            updateDomProperties(Dom, {}, Props)
        }
        //not first rendering
        //update
        //there are some changes
        else{
            const oldProps = oldDom.attributes ? fromAttributeToOldProps(oldDom.attributes) : {}
            updateDomProperties(Dom, oldProps, Props);

        }
        if(Dom.tagName.toLowerCase() !== 'undefined'){
            simpleMount(Dom, children, oldDom,parentDom)
            //after every children are added
            if(oldDom){
                return;
            }
             parentDom.appendChild(Dom)
        }
    }

    const simpleMount = (Dom, children, oldDom,parentDom) => {
        addText(Dom, children,oldDom, parentDom)
        if(oldDom){
            parentDom.replaceChild(Dom,oldDom)
        }
        console.log(parentDom)
        recurseChildrenDom(Dom,children, oldDom)
    }
    const addText = (Dom,children,oldDom, parentDom) => {
         if(!children) return;
         if(typeof children[0] === 'string'){
            const text = document.createTextNode(children[0])
            Dom.appendChild(text);
        }
    }
    const recurseChildrenDom = (Dom, children, oldDom) => {
        if(!children) return;
        else if(typeof children[0] === 'string')return;
        else if(!oldDom){
            children.map((childVdom) => diff(childVdom, Dom, oldDom))
        }
        else{
            children.map((childVdom,i) => {
                diff(childVdom, oldDom, oldDom.childNodes[i])
            }) 
        } 
    }



    const fromAttributeToOldProps = (attributes) => {
        if(attributes == null)return {};
        const oldProps = Object.values(attributes).reduce((acc, value,i) => {
          acc[attributes[i].name] = attributes[i].value
          return acc;
        }, {})
        return oldProps
      }
  
    const updateDomProperties = (dom, prevProps,nextProps) => {
  
              
                const setting = (prop, type = "add") => {
                    const isListener = name => name.startsWith('on');
                    const isAttributes = name => !isListener(name) && name !== 'children';
    
                    if(type === 'add'){
                    //set EventListener
                    Object.keys(prop).filter(isListener).forEach(name => {
                        const eventType = name.toLowerCase().substring(2)
                        dom.addEventListener(eventType, prop[name]);
                    })
                
                    //set Properties
                    
                    Object.keys(prop).filter(isAttributes).forEach(name => {
                        dom.setAttribute(name, prop[name]);
                    })
                    }
                    else{
                       //remove event
                        Object.keys(prop).filter(isListener).forEach(name => {
                            const eventType = name.toLowerCase().substring(2)
                            dom.removeEventListener(eventType, prop[name]);
                        })
                        //remove attributes
                        Object.keys(prop).filter(isAttributes).forEach(name => {
                            dom.removeAttribute(name)
                        })  
                    }
                }
            if(prevProps == null || prevProps == undefined || Object.keys(prevProps).length === 0){
                setting(nextProps)
            }
            else{
                //remove prevProps
                setting(prevProps, "delete")
                //add nextProps
                setting(nextProps)
                
            }
    }
  
    
    const  createElement = (type, props, ...args)  => { 
        let children = args.length ? [].concat(...args) : null;
        return { type, props, children };
        }
  
    return {
        render,
        createElement
    }
  })()
  
  /** @jsx Hound.createElement */
  const Hound = importThis;
  
  
  const ListView = (list) => {
    return (
    <ul>
        {
            list.map(value => (<li>{value}</li>))
        }
    </ul>
    )
  } 
  
  const Man = () => (
    <div>
      Yess
    </div>
  )
  
  
  const AppElement = (bool) => {
  
    const change2 = () => {
        Hound.render(AppElement(false), document.getElementById('root'))
    }

    const change1 = () => {
        Hound.render(AppElement(true), document.getElementById('root'))
    }


    return (
      <div>
        {
            bool ? <h2></h2> : <h3></h3>
        }
        <button onClick={change2}>false</button>
        <button onClick={change1}>true</button>
      </div>
    )
  }
  
  
  
  Hound.render(AppElement(true), document.getElementById('root'))
  

  
 