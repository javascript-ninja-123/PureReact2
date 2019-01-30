const importThis = (() => {


    const render = (vdom,parentDom, oldDom = parentDom.firstChild) => {
        diff(vdom,parentDom,oldDom);
    }

    const diff = (vdom,parentDom,oldDom) => {
        let oldvDom = oldDom ? oldDom._virtualDom : null;
        //first rendering && native element
        if(!oldDom && !isFunction(vdom) && !isComponent(vdom)){
            elementMount(vdom,parentDom,oldDom)
        }
        else if(isFunction(vdom) && isFragment(vdom)){
            diffFragment(vdom,parentDom,oldDom)
        }
        //if it is a function
        else if(isFunction(vdom)){
            diffFunction(vdom, parentDom, oldDom);
        }
        else if(isComponent(vdom)){
            diffComponent(vdom,parentDom, oldDom);
        }
        //type are equal and props are primitive and update
        else if(vdom.type === oldvDom.type && checkPropsisPrimitive(vdom.props, oldvDom.props) && vdom.type !== 'text'){
            //if props are equal just move on to the children
            if(propsEqual(vdom.props, oldvDom.props)){
                renderChild(vdom,parentDom,oldDom)
            }
            //if props are different just update
            else{
                elementUpdate(vdom, oldvDom,oldDom);  
            }
         }
        //type checking 
        else if(vdom.type === oldvDom.type){
            elementUpdate(vdom, oldvDom,oldDom);
        }
        //replace
        else{
            elementReplace(vdom,oldvDom,oldDom,parentDom)
        }
    }

    const renderChild = (vdom,parentDom,oldDom) => {
        vdom.children.forEach((childDom,i) => diff(childDom,oldDom, oldDom.childNodes[i]))
    }

    const isFragment = (vdom) => vdom.type.name === "Fragment"; 

    const diffFunction = (vdom,parentDom, oldDom) => {
        const element = switchToVirtualDom(vdom)
        return diff(element,parentDom, oldDom)
    }

    const diffFragment = (vdom,parentDom,oldDom) => {
        if(!oldDom){
            const element = vdom.type(vdom.props || {})
            element.forEach(childDom => diff(childDom,parentDom))
        }
        else{
            const element = vdom.type(vdom.props || {})
            let oldDOM = oldDom;
           element.forEach((childDom,i) =>{
               if(i === 0){
                    diff(childDom, parentDom, oldDOM)
                    oldDOM = oldDOM.nextSibling;
               }
               else{
                    diff(childDom, parentDom, oldDOM)
               }
           })
        }
    }

    const diffComponent = (vdom,parentDom,oldDom) => {
        if(!oldDom){
            const element = switchToVirtualDom(vdom, 'component')
            diff(element, parentDom,oldDom);
        }
        else{
            updateComponent(vdom,parentDom,oldDom);
        }
    }

    const updateComponent = (vdom,parentDom,oldDom) => {
        try{
            const component = new vdom.type(vdom.props || {})
     
            const oldComponent = oldDom._virtualComponent._virtualComponent;
            //should update check
            if(oldComponent.componentShouldUpdate(component.props)){
                 //update props
                oldComponent.updateProp(component.props);
                const element = component.render();
                diff(element, parentDom, oldDom);
                oldComponent.componetDidUpdate(oldComponent.props, oldComponent.state);
            }
            else{
                return;
            }
           
        }
        catch(err){
            component.componentCatchError(err)
        }
    }

    const switchToVirtualDom = (vdom, type = 'function') => {
        if(type === 'function'){
            const element = vdom.type(vdom.props || {});
            element._virtualFn = vdom
            return element;
        }
        else{
            const component = new vdom.type(vdom.props || {})
            //happens before it mounts
            component.componentWillMount();
            const element = component.render();
            element._virtualComponent = component
            return element
        }
    }

    const elementMount = (vdom,parentDom,oldDom) => {
        let newElement;
        const nextSibling = oldDom && oldDom.nextSibling;
        if(vdom.type === 'text'){
            newElement =  document.createTextNode(vdom.props.textContent)
        }
        else{
            newElement = document.createElement(vdom.type)
            updateDomProperties(newElement, {}, vdom.props);
        }
        
        if(nextSibling){
            parentDom.insertBefore(newElement, nextSibling)
        }
        else{
            parentDom.appendChild(newElement)
        }
        //adding ref
        if(vdom.props && vdom.props.ref){
            vdom.props.ref.current = newElement
        }
        //lifecycle for component
        if(vdom._virtualComponent){
            vdom._virtualComponent.setDomElement = newElement
            vdom._virtualComponent.componentDidMount();
            newElement._virtualComponent = vdom;
        }
        newElement._virtualDom = vdom
        vdom.children.forEach(childDom => diff(childDom, newElement, null))
        
    }

    const elementUpdate = (vdom,oldvDom,oldDom) => {
        if(vdom.type === 'text'){
            updateText(vdom,oldvDom, oldDom)
        }
        else{
            updateDomProperties(oldDom, {}, vdom.props);
        }
         vdom.children.forEach((childDom,i) => diff(childDom, oldDom, oldDom.childNodes[i]))
    }

    const updateText = (vdom,oldvDom,oldDom) => {
        if(vdom.props.textContent !== oldvDom.props.textContent){
            oldDom.textContent =   vdom.props.textContent ; 
        }
    }

    const elementReplace = (vdom,oldvDom,oldDom,parentDom) => {
        let newElement;
        newElement = document.createElement(vdom.type)
        updateDomProperties(newElement, {}, vdom.props);
        newElement._virtualDom = vdom;
        parentDom.replaceChild(newElement, oldDom)
        vdom.children.forEach((childDom,i) => diff(childDom,oldDom ,oldDom.childNodes[i]))
    }

    const propsEqual = (newProp,oldProp) => {
        const props = removeChildrenFromProp(newProp)
        const oldprops = removeChildrenFromProp(oldProp)
        let result = true;
        if(Object.keys(props).length ===0 && Object.keys(oldprops).length === 0) return;
        Object.keys(props).forEach(val => {
           if(props[val] !== oldprops[val]){
            result = false;
           }
        })
        return result;
    }

    const checkPropsisPrimitive = (newProps, oldProps) => {
        const props = removeChildrenFromProp(newProps)
        const result = Object.values(props).some(value => {
            if(typeof value === 'object' || Array.isArray(value) || typeof value === 'function' || typeof value === 'symbol'){
                return true;
            }
        })
        return !result;
    }

    const removeChildrenFromProp = props => {
        return Object.keys(props).reduce((acc,val) => {
            if(val !== 'children'){
                acc[props[val]] = props[val]
            }
            return acc;
        },{});
    }

    const isFunction = (vdom) => (
        vdom && typeof vdom.type === 'function' 
        && !(vdom.type.prototype && vdom.type.prototype.render)
    )

    const isComponent = vdom => (
         vdom.type && vdom.type.prototype && vdom.type.prototype.render
    )

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

const Fragment = props => props.children;


    const createElement = (type, attributes = {}, ...children)  => {
        //this is for this.props.children
        if(Array.isArray(children[0])){
            return {
                type,
                children:[...children[0]],
                props: Object.assign({ children:[...children[0]] }, attributes)
            }
        }
        let childElements = [...children].reduce(
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


const Ref = {};

class Component{
    constructor(props){
        this.props = props;
        this.state = {};
        this.dom;
    }

    set setDomElement(dom){
        this.dom = dom;
    }
    get getDomElement(){
        return this.dom;
    }
    updateProp(props){
        this.props = props;
    }
    
    setState(nextState){
        this.state = {...this.state, ...nextState};
        const oldDom = this.getDomElement;
        if(oldDom){
            const parentDom = oldDom.parentNode 
            const newVDom = this.render();
            newVDom._virtualComponent = this;
            diff(newVDom,parentDom, oldDom)    
        }
     

    }
    componentWillMount(){

    }
    componentDidMount(){

    }
    componentCatchError(err){

    }
    componetDidUpdate(prevProps,prevState){

    }

    componentShouldUpdate(nextProps){
        return nextProps !== this.props;
    }

}



return {
    createElement,
    render,
    Component,
    Ref,
    Fragment
}
})()

  /** @jsx Pureact.createElement */
  const Pureact = importThis;




  const AppUIFunction = () => {
      return(
          <div>
              what is up borther
          </div>
      )
  }


  class App extends Pureact.Component{
      state = {
          data:"what is up"
      }
      divRef = Pureact.Ref;
      componentCatchError(err){
          console.log(err)
      }
      componentWillMount(){
          console.log('happened before it mounts')
      }
      componentDidMount(){
          console.log('happened after it rendered')
      }
      onClick = e => {
          e.preventDefault();
          this.setState({data:"what is up sis"})
      }
      onClickReRender = e => {
          e.preventDefault();
          Pureact.render(<App text="should change"/>, document.getElementById('root'))
      }
      componetDidUpdate(prevProps,prevState){
          console.log(prevProps,prevState)
      }
      componentShouldUpdate(nextProps){
          return nextProps.text !== this.props.text
      }
      onClickFragment = e => {
          e.preventDefault();
          this.setState({data:"what is up sis"})
      }
      render(){
          return(
              <div class={this.state.data} ref={this.divRef}>
                 <AppUIFunction/>
                 <button onClick={this.onClick}>click</button>
                 <p>{this.props.text}</p> 
                 <button onClick={this.onClickReRender}>rerender</button>
                 <Pureact.Fragment>
                     <div onClick={this.onClickFragment}>fragment1</div>
                     <div>{this.state.data}</div>
                 </Pureact.Fragment>
              </div>
          )
      }
  }

  Pureact.render(<App text="before change"/>, document.getElementById('root'))

