

const importThis = (() => {
    
    const render = (vdom,parentDom, oldDom = parentDom.firstChild) => {
            diff(vdom,parentDom, oldDom);
    }

    const diff = (vdom, parentDom, oldDom) => {
        let oldVdom = oldDom && oldDom._virtualElement;
        if(!oldDom){
            mountElement(vdom,parentDom, oldDom);
        }
        else if(oldVdom && vdom.type === oldVdom.type){
            if(oldVdom.type === 'text'){
                updateTextNode(oldDom, vdom, oldVdom);
            }
            else{
                const oldProps = oldDom.attributes ? fromAttributeToOldProps(oldDom.attributes) : {}
                updateDomProperties(oldDom, oldProps, vdom.props)
            }


            oldDom._virtualElement = vdom;
            //doing index by index diffing
            vdom.children.forEach((childVdom,i) => diff(childVdom,oldDom, oldDom.childNodes[i]))

            //remove old dom
            let oldNodes = oldDom.childNodes;
            if(oldNodes.length > vdom.children.length){
                for(let i= oldNodes.length -1; i >= vdom.children.length; i-= 1){
                    let nodeToBeRemoved = oldNodes[i]
                    unmountNode(nodeToBeRemoved, oldDom)
                }
            }
        }
    }

    const unmountNode = (domElement, parentDom) => {
        domElement.remove();
    }

    const updateTextNode = (domElement,vdom, oldVdom) => {
        if(vdom.props.textContent !== oldVdom.props.textContent){
            domElement.textContent = vdom.props.textContent
        }
        //set a reference
        domElement._virtualElement = vdom;
    }

    const mountElement = (vdom,parentDom,oldDom) => {
        //render vdom as well as functions
        return mountSimpleNode(vdom,parentDom,oldDom) 
    }

    const mountSimpleNode = (vdom,parentDom,oldDom,parentComponent) => {
        let newDomElement = null;
        const nextSibling = oldDom && oldDom.nextSibling;
        if(vdom.type === 'text'){
            newDomElement = document.createTextNode(vdom.props.textContent)
        }
        else{
            newDomElement = document.createElement(vdom.type)
            updateDomProperties(newDomElement, {}, vdom.props)
        }
        //setting reference to vdom to dom
        newDomElement._virtualElement = vdom;
        if(nextSibling){
            parentDom.insertBefore(newDomElement, nextSibling)
        }
        else{
            parentDom.appendChild(newDomElement); 
        }

        vdom.children.forEach(childVdom => mountElement(childVdom,newDomElement))
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
  
    
   const createElement = (type, attributes = {}, ...children)  => {
        let childElements = [].concat(...children).reduce(
            (acc, child) => {
                if (child != null && child !== true && child !== false) {
                    if (child instanceof Object) {
                        acc.push(child);
                    } else {
                        acc.push(createElement("text", {
                            textContent: child
                        }));
                    }
                }
                return acc;
            }
            , []);
        return {
            type,
            children: childElements,
            props: Object.assign({ children: childElements }, attributes)
        }
    }

    return {
        render,
        createElement
    }
  })()
  
  /** @jsx Hound.createElement */
  const Hound = importThis;
  
  

  
  const AppElement = () => {
  
    const onClick = e => {
        e.preventDefault();
        Hound.render(AppElement(false), document.getElementById('root'))
    }

    return (
      <div class="dddd"> 
       <h3>asdfads</h3>
       <h4>dasfadsfadsfadsfadsfadsf</h4>
       <h4>stay</h4>
       <h1>going to be removed</h1>
      </div>
    )
  }
  
  
  
  Hound.render(AppElement(), document.getElementById('root'))

  const AppElement2 = () => {
  
    const onClick = e => {
        e.preventDefault();
        Hound.render(AppElement(false), document.getElementById('root'))
    }

    return (
      <div class="dddd"> 
       <h3>manman</h3>
       <h4>upup</h4>
       <h4>stay</h4>
      </div>
    )
  }
  

setTimeout(() => {
    Hound.render(AppElement2(), document.getElementById('root'))
},2000)
  

  
 