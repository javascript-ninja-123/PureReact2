
const importThis = (() => {
    
    const render = (vdom,parentDom, oldDom = parentDom.firstChild) => {
        diff(vdom,parentDom,oldDom );
    }

    const diff = (vdom,parentDom,oldDom) => {
        let oldVdom = oldDom ? oldDom._virtualdom : null;
        if(!oldDom && !isFunc(vdom.type) && !isStateFulComponent(vdom)){
            elementMount(vdom,parentDom,oldDom)
        }
        //stateful component
        else if(isStateFulComponent(vdom)){
            //firstrender
            if(!oldDom){
                return diffComponent(vdom, null, parentDom, oldDom)
            }
            const oldComponent = oldDom._virtualdom._virtualComponent
            //update
            diffComponent(vdom, oldComponent, parentDom, oldDom)
        }
        //functional component
        else if(isFunctionalComponent(vdom)){
            //first render
            if(!oldDom){
                return diffComponent(vdom, null, parentDom, oldDom)
            }
            //update
            diffComponent(vdom, oldDom._virtualFn, parentDom, oldDom)
        }
        //if type and props are equal, just mvoe to its children
        //omit text
        // else if(vdom.type === oldVdom.type && checkProps(oldVdom.props, vdom.props) && vdom.type !== 'text'){
        //     console.log('old',oldVdom.props)
        //     console.log('new', vdom.props)
        //     elementMoveToChild(vdom,parentDom, oldDom);
        // }
        //if type is equal 
        // or if it is a text
        else if(vdom.type === oldVdom.type){

            elementUpdate(vdom, oldVdom, oldDom) 
        }
        //else just replace
        else {
            elementReplace(vdom,parentDom, oldDom);
        }

        //create a collection of keyed elements
        let keyedElement = {};
        

        if(!isFunc(vdom.type)){
        //after everytihing all rendered
            if(oldDom !== null && oldDom !== undefined){
                let oldNodes = oldDom.childNodes;
                let newNodes = vdom.children.length;
                if(oldNodes.length > newNodes){
                    for(let i = oldNodes.length - 1; i>= newNodes; i--){
                        const nodeToBeRemoved = oldNodes[i]
                        unmountNode(nodeToBeRemoved, oldDom)   
                    }
                }
                }
        }
    }

    const diffComponent = (vdom, oldComponent, parentDom,oldDom) => {
        let nextvDom;
        if(!oldComponent){
            if(vdom.type.name === 'Fragment'){
                
                return mountFragmentComponent(vdom,parentDom,oldDom);
            }
            else if(isStateFulComponent(vdom)){
                nextvDom = buildStateFulComponent(vdom);
                nextvDom._virtualComponent.componentWillMount()
            }
            else if(isFunctionalComponent(vdom)){
                nextvDom = buildFunctionalComponent(vdom);
                nextvDom._virtualFn = vdom;
            }
            diff(nextvDom, parentDom,oldDom);
        }
        else{

            if(isFunctionalComponent(vdom)){
                nextvDom = buildFunctionalComponent(vdom);
                nextvDom._virtualFn = vdom;
            }
            else if(isSameComponentType(oldComponent,vdom)){
                return updateNewComponent(vdom,oldComponent,parentDom,oldDom)
            }
            else{
               nextvDom = isStateFulComponent(vdom); 
            }
            diff(nextvDom, parentDom, oldDom)
        }
    }

    const isSameComponentType = (oldComponent,vdom) => {
        return oldComponent && vdom.type === oldComponent.__proto__.constructor
    }

    const updateNewComponent = (vdom,oldComponent,parentDom,oldDom) => {
        //lifecycle method
        try{
            if(oldComponent.componentShouldUpdate(vdom.props)){
                oldComponent.updateProp(vdom.props);
                const nextElement = oldComponent.render();
                nextElement._virtualComponent = oldComponent;
                diff(nextElement, parentDom,oldDom)
                oldComponent.componentDidUpdate(oldComponent.props, oldComponent.state);
               
            }
            else{
                return;
            }
        }
        catch(err){
            oldComponent.componentDidCatchError(err)
        }
    }



    const elementMoveToChild = (vdom,parentDom,oldDom) => {
        return simpleElementMoveToChild(vdom,parentDom,oldDom)
    }

    const unmountNode = (domElement, parentDom) => {
        domElement.remove();
    }

    const elementReplace = (vdom,parentDom, oldDom) => {
         simpleElementReplace(vdom, parentDom, oldDom)
    }


    const elementUpdate = (vdom, oldVdom, oldDom) => {
      return simpleUpdateNode(vdom, oldVdom, oldDom)
    }

    const elementMount = (vdom,parentDom, oldDom) => {
        return simpleRenderNode(vdom,parentDom,oldDom)
    }


    const updateText = (vdom, oldVdom, element) => {
        if(vdom.props.textContent !== oldVdom.props.textContent){
            element.textContent =   vdom.props.textContent ; 
        }
    }



    const mountFragmentComponent = (vdom,parentDom,oldDom) => {
        if(oldDom !== undefined){

            vdom.children.forEach((childVDom, i) => {

                diff(childVDom, oldDom, oldDom.childNodes[0])
            })
        }
        else{
            console.log("this is insdie of fragment",vdom)
            vdom._virtualFn = vdom;
            vdom.children.forEach((childVDom, i) => simpleRenderNode(childVDom, parentDom, null)) 
        }
    }

    const buildFunctionalComponent = (vdom,context) => {
        return vdom.type(vdom.props || {})
    };

    const buildStateFulComponent = (vdom) => {
       const component = new vdom.type(vdom.props || {}) 
       const nextElement =  component.render();
       nextElement._virtualComponent = component;
       return nextElement
    }

    const simpleElementReplace = (vdom, parentDom, oldDom) => {
        simpleReplaceNode(vdom, oldDom,parentDom)
    }

    const simpleElementMoveToChild = (vdom,parentDom,oldDom) => {
        vdom.children.forEach((childVdom,i) => diff(childVdom, oldDom, oldDom.childNodes[i]))
    }


    const simpleUpdateNode = (vdom, oldVdom, oldDom) => {
        if(vdom.type === 'text'){
            updateText(vdom, oldVdom, oldDom)
        }
        else{
            const oldProps = oldDom.attributes ? fromAttributeToOldProps(oldDom.attributes) : {}
            updateDomProperties(oldDom, oldProps, vdom.props);
            oldDom._virtualdom = vdom;
            vdom.children.forEach((childVdom,i) => diff(childVdom, oldDom, oldDom.childNodes[i]))
        }
    }

    const simpleReplaceNode = (vdom, oldDom,parentDom) => {
        let domElement;
        const nextSibling = oldDom && oldDom.nextSibling;
        if(vdom.type === "text"){
            domElement = document.createTextNode(vdom.props.textContent); 
            parentDom.appendChild(domElement)
        }
        else if(!oldDom){
            return diff(vdom, parentDom,oldDom)
        }
        else{
            domElement = document.createElement(vdom.type);
            updateDomProperties(domElement, {}, vdom.props);
            domElement._virtualdom = vdom;
            oldDom.remove();
            if(nextSibling){
                parentDom.insertBefore(domElement, nextSibling)
            }
            else{
                parentDom.appendChild(domElement)
            }
        }
        vdom.children.forEach((childVdom,i) => {
            elementReplace(childVdom, domElement, oldDom.childNodes[i])
        })
    } 


    const simpleRenderNode = (vdom,parentDom,oldDom) => {
        let domElement = null;
        const nextSibling = oldDom && oldDom.nextSibling;
        if(vdom.type === 'text'){
            domElement = document.createTextNode(vdom.props.textContent);
        }
        else{
            domElement = document.createElement(vdom.type);
            updateDomProperties(domElement, {}, vdom.props);
        }
        domElement._virtualdom = vdom;
        domElement._virtualFn = vdom._virtualFn;
        
        if(nextSibling){
            parentDom.insertBefore(newDomElement, nextSibling)
        }
        else{
            parentDom.appendChild(domElement)
        }
        let component = vdom._virtualComponent;
        if(component){
            component.setDomElement = domElement
            component.componentDidMount();
        }

        if(vdom.props && vdom.props.ref){
            vdom.props.ref.current = domElement;
        }
        
        vdom.children.forEach(childVdom => diff(childVdom, domElement))

    }    

    const checkProps = (prevProps, newProps) => {
        let result = true;
        for(let i = 0; i< Object.keys(newProps).length -1; i++){
            if(Object.keys(newProps)[i] === 'children'){
                continue;
            }
            else{
                const ValueFromNewProp = newProps[Object.keys(newProps)[i]]
                const ValueFromPrevProp = prevProps[Object.keys(newProps)[i]]
                if(typeof ValueFromNewProp === 'string' || 
                   typeof ValueFromNewProp === 'number' || 
                   typeof ValueFromNewProp === 'boolean' || 
                   typeof ValueFromNewProp === 'undefined'
                   ){
                       if(ValueFromNewProp !== ValueFromPrevProp){
                           result = false;
                           break;
                       }
                }
                else if(Array.isArray(ValueFromNewProp && Array.isArray(ValueFromPrevProp))){
                    if(!compareArray(ValueFromPrevProp, ValueFromNewProp)){
                        result = false;
                        break;
                    }
                }
                else if((typeof ValueFromNewProp === 'function' && typeof ValueFromPrevProp === 'function')|| (
                    typeof ValueFromNewProp === 'symbol' && typeof ValueFromPrevProp === 'symbol'
                )){
                    if(ValueFromNewProp.toString() !== ValueFromPrevProp.toString()){
                        result = false;
                        break;
                    }
                }
                else if(typeof ValueFromNewProp === 'object' && ValueFromPrevProp === 'object'){
                    if(!checkProps(ValueFromPrevProp, ValueFromNewProp)){
                        result = false;
                        break;
                    }
                }
                else{
                    result = false;
                    break;
                }
            }
        }
        return result;
    }   

    const compareArray = (oldArray,newArray) => {
        let result = true;
        for(let i =0; i< newArray.length -1; i ++){
            const ValueFromNewProp = newArray[i]
            const ValueFromPrevProp = oldArray[i]
            if(typeof ValueFromNewProp === 'string' || 
               typeof ValueFromNewProp === 'number' || 
               typeof ValueFromNewProp === 'boolean' || 
               typeof ValueFromNewProp === 'undefined'
               ){
                if(ValueFromNewProp !== ValueFromPrevProp){
                    result = false;
                    break;
                }
            }
            else if(Array.isArray(ValueFromNewProp) && Array.isArray(ValueFromPrevProp)){
                if(!compareArray(ValueFromPrevProp, ValueFromNewProp)){
                    result = false;
                    break;
                }
            }
            else if((typeof ValueFromNewProp === 'function' && typeof ValueFromPrevProp === 'function')|| (
                typeof ValueFromNewProp === 'symbol' && typeof ValueFromPrevProp === 'symbol'
            )){
                if(ValueFromNewProp.toString() !== ValueFromPrevProp.toString()){
                    result = false;
                    break;
                }
            }
            else if(typeof ValueFromNewProp === 'object' && typeof ValueFromPrevProp === 'object'){
                if(!checkProps(ValueFromPrevProp, ValueFromNewProp)){
                    result = false;
                    break;
                }
            }
            else{
                result = false;
                break;
            }
        }

        return result;
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


    const isFunc = obj => obj && typeof obj === 'function';

    const isFunctionalComponent = vdom => {
        return vdom && vdom.type && isFunc(vdom.type)
        && !(vdom.type.prototype && vdom.type.prototype.render)
    }

    const isStateFulComponent = vdom => {
        return vdom.type && vdom.type.prototype && vdom.type.prototype.render
    }
  
    
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
const Fragment = (props) => {
        return props.children
    }

const Ref = {};  

class Component{
    constructor(props){
        this.props = props;
        this.state = {};
        this.prevState = {};
    }

    setState(nextState = {}){
        const dom = this.getDomElement;
        const parentDom = dom.parentNode;
        if(!this.prevState) this.prevState = this.state;
        this.state = {...this.state, ...nextState};
        let newvDom = this.render();
        newvDom._virtualComponent = this;
        diff(newvDom, parentDom, dom);
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
    componentWillMount(){

    }
    componentDidCatchError(err){
  
    }
    componentDidMount(){

    }
    componentDidUpdate(prevProps,prevState){
       
    }
    componentWillUnMount(){

    }
    componentShouldUpdate(nextProps){
        return nextProps !== this.props
    }

}


    return {
        render,
        createElement,
        Fragment,
        Component,
        Ref
    }
  })()
  
  /** @jsx Pureact.createElement */
  const Pureact = importThis;
  
  
const Button = ({onClick}) => {
    return(
        <button onClick={onClick}>what is up</button>
    )
}

class App extends Pureact.Component{
    state = {
        data:"what is up brother",
        error:false,
        value:''
    }
    inputRef = Pureact.Ref

    componentWillMount(){
        console.log('component will mount')
    }
    componentDidMount(){
        console.log('component did mount')
    }
    componentShouldUpdate(nextProps){
        return nextProps.message !== this.props.message
    }
    componentDidCatchError(err){
        // console.log('this is an error',err)
        this.setState({error:true})
    }
    componentDidUpdate(prevProps,prevState){
        // console.log('this is a prevProp from ', prevProps)
        // console.log('this is a prevState from ', prevState)
    }
    onClick = e => {
        e.preventDefault();
        // console.log('yessss')
    }
    ChangeState = e => {
        e.preventDefault();
        this.setState({data:"what is up sister"})

    }

    Update = (e) => {
        e.preventDefault();
       this.inputRef.current.focus();
    }
    onChange = ({target}) => this.setState({[target.name]:target.value})
    render(){
        return(
            <div class="sungmin yi">
               <p>{this.props.message}</p>
               <p>{this.state.data}</p>
               <Button onClick={this.onClick}/>
               <button onClick={this.ChangeState}> Change what is up to changed</button>
               <button onClick={this.Update}>Update</button>
               <input  onChange={this.onChange} name="value" value={this.state.value} ref={this.inputRef}/>
               {/* <Pureact.Fragment>
                   <div>
                     inside of fragment
                   </div>
               </Pureact.Fragment> */}
            </div>
        )
    }
}



Pureact.render(<App message='yesss'/>, document.getElementById('root'))

//diffing //reconcilation of two stateful components




 



  
 