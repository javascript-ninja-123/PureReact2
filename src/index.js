import './app8';

// const importThis = (() => {

//     let rootInstance;
//     const render = (element,parentDom) => {
//         const prevInstance = rootInstance;
//         const nextInstance = reconcile(parentDom, prevInstance,element)
//         rootInstance = nextInstance;
//     }

//     const reconcile = (parentDom, instance,element) => {
//         if(!instance){
//             const newIstance = institate(element)
//             parentDom.appendChild(newIstance.dom)
//             return newIstance;
//         }
//         else if(element == null){
//                // Remove instance
//                 parentDom.removeChild(instance.dom);
//                 return null;
//         }
//         else if(instance.element.type === element.type){
//             updateDomProperties(instance.dom, instance.element.props, element.props);
//             instance.childInstances = reconcileChildren(instance, element);
//             instance.element = element;
//             return instance;
//         }
//         else{
//             const newIstance = institate(element)
//             parentDom.replaceChild(newIstance.dom, instance.dom)
//             return newIstance;
//         }
//     }

//     const reconcileChildren = (instance,element) => {
//         const dom = instance.dom;
//         const childInstances = instance.childInstances;
//         const nextChildElements = element.props.children || [];
//         const newChildInstances = [];
//         const count = Math.max(childInstances.length, nextChildElements.length);
//         for (let i = 0; i < count; i++) {
//           const childInstance = childInstances[i];
//           const childElement = nextChildElements[i];
//           const newChildInstance = reconcile(dom, childInstance, childElement);
//           newChildInstances.push(newChildInstance);
//         }
//         return newChildInstances.filter(instance => instance != null);
//     }

//     const institate = (element) => {
//         const {type,props,children} = element;
//         const dom =  document.createElement(type);
//         const Prop = props || {};
//         const childElements =children || [];
//         if(typeof  childElements[0] !== 'object' && (typeof childElements[0] === 'string' || typeof childElements[0] === 'number')){
//             dom.innerHTML = childElements[0]
//         }
//         updateDomProperties(dom, {}, Prop);    

//         const childInstance = childElements.map(institate);
//         const ChildDom = childInstance.map(childInstance => childInstance.dom);
//         ChildDom.forEach(childDom => dom.appendChild(childDom))
//         return {dom, element, childInstance}
//     }
    

//     const updateDomProperties = (dom, prevProps,nextProps) => {

              
//                 const setting = (prop, type = "add") => {
//                     const isListener = name => name.startsWith('on');
//                     const isAttributes = name => !isListener(name) && name !== 'children';
    
//                     if(type === 'add'){
//                     //set EventListener
//                     Object.keys(prop).filter(isListener).forEach(name => {
//                         const eventType = name.toLowerCase().substring(2)
//                         dom.addEventListener(eventType, prop[name]);
//                     })
                
//                     //set Properties
                    
//                     Object.keys(prop).filter(isAttributes).forEach(name => {
//                         dom.setAttribute(name, prop[name]);
//                     })
//                     }
//                     else{
//                        //remove event
//                         Object.keys(prop).filter(isListener).forEach(name => {
//                             const eventType = name.toLowerCase().substring(2)
//                             dom.removeEventListener(eventType, prop[name]);
//                         })
//                         //remove attributes
//                         Object.keys(prop).filter(isAttributes).forEach(name => {
//                             dom.removeAttribute(name)
//                         })  
//                     }
//                 }
//             if(Object.keys(prevProps).length === 0){
//                 setting(nextProps)
//             }
//             else{
//                 //remove prevProps
//                 setting(prevProps, "delete")
//                 //add nextProps
//                 setting(nextProps)
                
//             }
//     }

    
//     const  createElement = (type, props, ...args)  => { 
//         // if(typeof type === 'function'){
//         //     if(props && Object.keys(props).length > 0){
//         //       return type(props);
//         //     }
//         //     return type();
//         // }
//         let children = args.length ? [].concat(...args) : null;
//         return { type, props, children };
//         }

//     return {
//         render,
//         createElement
//     }
// })()

// /** @jsx Hound.createElement */
// const Hound = importThis;


// const ListView = (list) => {
//     return (
//     <ul>
//         {
//             list.map(value => (<li>{value}</li>))
//         }
//     </ul>
//     )
// } 


// const AppElement = (like) => {

//     const onClick = e => {
//         e.preventDefault();
//         Hound.render(AppElement("newLike"), document.getElementById('root'))
//     }


//     return (
//         <div class={like}>     
//             <ul class="ulman">{ListView(["d","s"])}</ul>
//             <h2>dd</h2>
//             <button onClick={onClick}>yes</button>
//         </div>
//     )
// }



// Hound.render(AppElement("like"), document.getElementById('root'))


