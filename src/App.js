import logo from './logo.svg';
import './App.css';
import React,{useEffect,useState} from 'react';
import Post  from './post';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';//background is dimmed and create popup window
import { makeStyles } from '@material-ui/core/styles'; //create custom css classes inside JavaScript
import Input from '@material-ui/core/Input';
import CircularProgress from '@material-ui/core/CircularProgress';
import ImageUpload from './imageUpload';

const BASE_URL = 'https://fastapi-instagram-backend-1.onrender.com'

function getModalStyle(){  //decides where the popup appears
  const top = 50;
  const left = 50;

  return{
    top:`${top}%`,
    left:`${left}%`,
    transform: `translate(-${top}%,-${left}%)`   //split and make exact center
  };
}
const useStyles = makeStyles((theme)=>({    
  paper:{     ///popup as a sheet of paper
    backgroundColor: theme.palette.background.paper,
    position:"absolute",
    width :400,
    border: '2px solid #000',
    boxShadow:theme.shadows[5],
    padding:theme.spacing(2,4,3)
  }
}))

function App() {
  const classes =useStyles()   //calling usestyles
  
  const [posts,setPosts] = useState([]);
  const [openSignIn,setOpenSignIn]= useState(false);
  const [openSignUp,setOpenSignUp]= useState(false);
  const [modalStyle,setModalStyle]= useState(getModalStyle);
  const [username,setUsername]= useState('');
  const [password,setPassword]= useState('');
  const [authToken,setAuthToken]= useState(null);
  const [authTokenType,setAuthTokenType]= useState('null');
  const [userId,setUserId]= useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {   //reads data from localstorage
    setAuthToken(window.localStorage.getItem('authToken'));
    setAuthTokenType(window.localStorage.getItem('authTokenType'));
    setUsername(window.localStorage.getItem('username'));
    setUserId(window.localStorage.getItem('userId'));
  }, []) 

  useEffect(() => { //keep localstorage updated when changes happen
    authToken
      ? window.localStorage.setItem('authToken',authToken)
      : window.localStorage.removeItem('authToken') //ternary if else, remove with key
    authTokenType
      ? window.localStorage.setItem('authTokenType',authTokenType)
      : window.localStorage.removeItem('authTokenType');
    username
      ? window.localStorage.setItem('username',username)
      : window.localStorage.removeItem('username');
    userId
      ? window.localStorage.setItem('userId',userId)
      : window.localStorage.removeItem('userId');
  }, [authToken,authTokenType,username,userId])
  
  
  useEffect(() => {
    fetch(BASE_URL + 'post/all')
    .then( async response =>{
      const json = await response.json()
      console.log(json);
      if(response.ok){
        return json
      }
      throw response
    })
    .then(data =>{
      const result = data.sort((a,b) =>{
        const t_a = a.timestamp.split(/[-T:]/);     // slash is regex
        const t_b = b.timestamp.split(/[-T:]/);     //2026 | 07 | 06 | 10 | 30 | 15
        const d_a = new Date(Date.UTC(t_a[0],t_a[1]-1,t_a[2],t_a[3],t_a[4],t_a[5]));  //in JS month starts from 0 so -1
        const d_b = new Date(Date.UTC(t_b[0],t_b[1]-1,t_b[2],t_b[3],t_b[4],t_b[5]));  //converts to ms
        //a,b= b(newer) then a=b,c  etc..
        return d_b - d_a  //d_b = 1783328400000//d_a = 1783247415000// milisec//if result positive/b is newer so put b before a.
      })
      return result
    })
    .then(data=>{
      setPosts(data)
      setLoading(false);
    })
    .catch(error =>{
      console.log(error)
      alert(error)
    })
  }, [])

   if (loading) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <CircularProgress />
        </div>
    );
}
  
  
const signIn = (event) =>{
    event?.preventDefault();
    let formData = new FormData();
    formData.append('username',username);
    formData.append('password',password);
    const requestOptions = {
      method:'POST',
      body:formData
    }
    fetch(BASE_URL+'login',requestOptions)
    .then(response=>{
      if (response.ok){
        return response.json()
      }
      throw response
    })
    .then(data=>{
      console.log(data);
      setAuthToken(data.access_token)
      setAuthTokenType(data.token_type)
      setUserId(data.user_id)
      setUsername(data.username)
    })
    .catch(error=>{
      console.log(error)
      alert(error)   //popup
    }
    )
    setOpenSignIn(false); //dailoge box disapper
}

const signOut=(event)=>{
  setAuthToken(null)
  setAuthTokenType(null)
  setUserId('')
  setUsername('')
}
const signUp=(event)=>{
  event.preventDefault();

  ////username: "Nava" (js objects) to "username":"nava" (json text)

  const json_string = JSON.stringify({   // convert it to text string
    username:username,
    email:email,
    password: password
  })

  const requestOption ={
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: json_string     //string can be send over the internet
  }

  fetch(BASE_URL +'user/',requestOption)
    .then(response =>{
      if(response.ok){
        return response.json()
      }
      throw response
    })
    .then(data =>{
      signIn();  //signin even ?undefied 
    })
    .catch(error=>{
      console.log(error);
      alert(error);
    })

  setOpenSignUp(false)
}

  return (
    <div className=" app">
      <Modal 
        open= {openSignIn}  //modal open when its true
        onClose={()=>setOpenSignIn(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className='app_signin'>
            <center>
              <img className='app_headerImage'
                src='https://i.pinimg.com/736x/8f/ed/98/8fed9894c004a7612581652946e2bf39.jpg'
                alt='Instagram'/>
            </center>
            <Input 
              placeholder='username'
              type='text'
              value={username}
              onChange={(e)=> setUsername(e.target.value)}/>  
              <Input 
              placeholder='password'
              type='password'
              value={password}
              //instantly updates the state for each letters user types e is a event
              onChange={(e)=> setPassword(e.target.value)}/>
              <Button 
                type='submit'
                onClick={signIn}>Login</Button>
          </form>
        </div>
      </Modal>

      <Modal 
        open= {openSignUp}  //modal open when its true
        onClose={()=>setOpenSignUp(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className='app_signin'>
            <center>
              <img className='app_headerImage'
                src='https://i.pinimg.com/736x/8f/ed/98/8fed9894c004a7612581652946e2bf39.jpg'
                alt='Instagram'/>
            </center>
            <Input 
              placeholder='username'
              type='text'
              value={username}
              onChange={(e)=> setUsername(e.target.value)}/>
              <Input 
              placeholder='email'
              type='text'
              value={email}
              onChange={(e)=> setEmail(e.target.value)}/> 
              <Input 
              placeholder='password'
              type='password'
              value={password}
              //instantly updates the state for each letters user types e is a event
              onChange={(e)=> setPassword(e.target.value)}/>
              <Button 
                type='submit'
                onClick={signUp}>Sign up</Button>
          </form>
        </div>
      </Modal>
      <div className='app_header'>
        <img className='app_headerImage'
           src='https://i.pinimg.com/736x/8f/ed/98/8fed9894c004a7612581652946e2bf39.jpg'
           alt='Instagram'/>
           {authToken ? (
            <Button onClick={()=>signOut()}>Logout</Button>
            ):(
            <div>
             <Button onClick={()=>setOpenSignIn(true)}>Login</Button>
             <Button onClick={()=>setOpenSignUp(true)}>Signup</Button>
            </div>
            )
            }
      </div>
      <div className='app_posts'>
      {
        posts.map(post =>(  //post is array of posts 
          <Post   //react component
            key={post.id} //special prob used by react to identify each item in list
            post = {post}//normal prob passing to Post component
            authToken={authToken}
            authTokenType={authTokenType}
            username={username}
          />
        ))
      }
      </div>
      {
        authToken?(
          <ImageUpload
             authToken={authToken}
             authTokenType={authTokenType}
             userId={userId}
          />
        ):(
          <h3>You need to login to upload</h3>
        )
      }
    </div>
  );
}

export default App;
