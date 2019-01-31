
const importThis = (() => {



  const render = (element,parentDom, oldDom = parentDom.firstChild) => {
    //oldDom is a previous dom tree to compare parentDom to oldDom.
    diff(element,parentDom,oldDom);
  }


  const diff = (elementObj,parentDom, oldDom) => {
    const {type, children, props} = elementObj;
    //craete a dom
    const DOM = document.createElement(type);
    const PROPS = props || {};
    if(oldDom == null){
      //update a dom
      updateDomProperties(DOM, {}, PROPS);
      //append a dom to its parents

    }
    if(typeof elementObj === 'number' || typeof elementObj === 'string'){
        const text = document.createTextNode(elementObj)
        parentDom.appendChild(text)
    }

    else if(oldDom && oldDom.tagName && type === oldDom.tagName.toLowerCase()){
      if(checkProps(oldDom.attributes, PROPS)){
        updateDomProperties(DOM, {}, PROPS);
        oldDom.replaceWith(DOM);
      }
      else{
        const oldProps = fromAttributeToOldProps(oldDom.attributes)
        updateDomProperties(DOM, oldProps, PROPS);
        oldDom.replaceWith(DOM);
      }
    }

 
  
    else{
      if(oldDom && oldDom.attributes){
        const oldProps = fromAttributeToOldProps(oldDom.attributes)
        updateDomProperties(DOM, oldProps, PROPS);
        oldDom.replaceWith(DOM);
      }
      else{
        updateDomProperties(DOM, {}, PROPS);
      } 
    }



    if(DOM.tagName && DOM.tagName.toLowerCase() === "undefined"){
      if(Array.isArray(children)){
        children.map((childElementObj,) => {
          diff(childElementObj, DOM)
        })
      }
    }
    else{
      parentDom.appendChild(DOM)
      if(Array.isArray(children)){
        children.map((childElementObj,) => {
          diff(childElementObj, DOM)
        })
      }
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

  const checkProps = (attributes, newProps) => {
    const oldProps = fromAttributeToOldProps(attributes)
    return JSON.stringify(oldProps) === JSON.stringify(newProps)
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


const TinyReact = (function () {
  function createElement(type, attributes = {}, ...children) {
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

  const render = function (vdom, container, oldDom = container.firstChild) {
      diff(vdom, container, oldDom);
  }

  const diff = function (vdom, container, oldDom) {
      let oldvdom = oldDom && oldDom._virtualElement;

      if (!oldDom) {
          mountElement(vdom, container, oldDom);
      }
      else if (oldvdom && oldvdom.type === vdom.type) {
        console.log(vdom, container)
        console.log('old',oldvdom)
          if (oldvdom.type === "text") {
              updateTextNode(oldDom, vdom, oldvdom);
          } else {
              updateDomElement(oldDom, vdom, oldvdom);
          }

          // Set a reference to updated vdom
          oldDom._virtualElement = vdom;

          // Recursively diff children..
          // Doing an index by index diffing (because we don't have keys yet)
          vdom.children.forEach((child, i) => {
              diff(child, oldDom, oldDom.childNodes[i]);
          });

      }
  }

  function updateTextNode(domElement, newVirtualElement, oldVirtualElement) {
      if (newVirtualElement.props.textContent !== oldVirtualElement.props.textContent) {
          domElement.textContent = newVirtualElement.props.textContent;
      }
      // Set a reference to the newvddom in oldDom
      domElement._virtualElement = newVirtualElement;
  }


  const mountElement = function (vdom, container, oldDom) {
      // Native DOM elements as well as functions.
      return mountSimpleNode(vdom, container, oldDom);
  }

  const mountSimpleNode = function (vdom, container, oldDomElement, parentComponent) {
      let newDomElement = null;
      const nextSibling = oldDomElement && oldDomElement.nextSibling;

      if (vdom.type === "text") {
          newDomElement = document.createTextNode(vdom.props.textContent);
      } else {
          newDomElement = document.createElement(vdom.type);
          updateDomElement(newDomElement, vdom);
      }

      // Setting reference to vdom to dom
      newDomElement._virtualElement = vdom;
      if (nextSibling) {
          container.insertBefore(newDomElement, nextSibling);
      } else {
          container.appendChild(newDomElement);
      }

      //TODO: Render children
      vdom.children.forEach(child => {
          mountElement(child, newDomElement);
      });

  }

  //TODO: Set DOM attributes and events
  function updateDomElement(domElement, newVirtualElement, oldVirtualElement = {}) {
      const newProps = newVirtualElement.props || {};
      const oldProps = oldVirtualElement.props || {};
      Object.keys(newProps).forEach(propName => {
          const newProp = newProps[propName];
          const oldProp = oldProps[propName];
          if (newProp !== oldProp) {
              if (propName.slice(0, 2) === "on") {
                  // prop is an event handler
                  const eventName = propName.toLowerCase().slice(2);
                  domElement.addEventListener(eventName, newProp, false);
                  if (oldProp) {
                      domElement.removeEventListener(eventName, oldProp, false);
                  }
              } else if (propName === "value" || propName === "checked") {
                  // this are special attributes that cannot be set
                  // using setAttribute
                  domElement[propName] = newProp;
              } else if (propName !== "children") {
                  // ignore the 'children' prop
                  if (propName === "className") {
                      domElement.setAttribute("class", newProps[propName]);
                  } else {
                      domElement.setAttribute(propName, newProps[propName]);
                  }
              }
          }
      });
      // remove oldProps
      Object.keys(oldProps).forEach(propName => {
          const newProp = newProps[propName];
          const oldProp = oldProps[propName];
          if (!newProp) {
              if (propName.slice(0, 2) === "on") {
                  // prop is an event handler
                  domElement.removeEventListener(propName, oldProp, false);
              } else if (propName !== "children") {
                  // ignore the 'children' prop
                  domElement.removeAttribute(propName);
              }
          }
      });
  }

  return {
      createElement,
      render
  }
}());






/** @jsx Hound.createElement */
const Hound = TinyReact;


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


const AppElement = () => {
  return (
      <div set='man'> 
          <h2>dsafds</h2>
          <h3>dasfadgasdgasgsd</h3>
          <p>dasfadgasdgasgsd</p>
      </div>
  )
}



Hound.render(AppElement(), document.getElementById('root'))




const WWW = () => {
  return (
      <div set='man'> 
          <h2>324324</h2>
          <h3>eeee</h3>
          <p>555</p>
      </div>
  )
}


setTimeout(() => {
  console.log('worked')
  Hound.render(WWW(), document.getElementById('root'))
},3000)