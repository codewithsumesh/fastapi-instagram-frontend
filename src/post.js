import React,{useState,useEffect} from 'react'
import './post.css'
import { Avatar,Button} from '@material-ui/core'

const BASE_URL = 'https://fastapi-instagram-backend-1.onrender.com/'
//Text → useState('')
//Number → useState(0)
//True/False → useState(false)
//List of items → useState([])
//Object → useState({}) (not multiple value)
function Post({post,authToken,authTokenType,username}){
    const [imageUrl,setImageUrl] = useState('')    // url is '' single
    const [comments,setComments] =useState([])     // multiple comments
    const [newComment,setNewComment]=useState('')

    useEffect(() => {
        if (post.image_url_type === 'absolute'){
            setImageUrl(post.image_url)
        }else{
            setImageUrl(BASE_URL + post.image_url)
        }
    }, [post.imageUrl,post.image_url_type])   //dependency

    useEffect(() => {
      setComments(post.comments)
    }, [])
    
    const handleDelete= (event)=>{
        event?.preventDefault();

        const requestOptions={
            method:'GET',
            headers: new Headers({
                'Authorization':authTokenType + ' ' + authToken
            })
        }
        fetch(BASE_URL + 'post/delete/'+ post.id,requestOptions)
        .then(response=>{
            if(response.ok){
                window.location.reload()
            }
        })
        .catch(error=>{
            console.log(error);
        })
    }
    const postComment = (event)=>{
        event?.preventDefault()

        const json_string = JSON.stringify({
            'username': username,
            'text': newComment,
            'post_id': post.id
        })
        const requestOptions ={
            method:'POST',
            headers:new Headers({
                'Authorization': authTokenType +' '+ authToken,
                'content-Type': 'application/json'
            }),
            body:json_string
        }
        console.log(json_string);
        console.log(typeof json_string);
        console.log(requestOptions.body);
        console.log(typeof requestOptions.body);
        fetch(BASE_URL + 'comment',requestOptions)
        .then(response=>{
            if(response.ok){
                return response.json()
            }
        })
        .then(data =>{
            fetchComments()
        })
        .catch(error=>{
            console.log(error)
        })
        .finally(()=>{
            setNewComment('')
        })
    }

    const fetchComments=()=>{
        fetch(BASE_URL + 'comment/all/'+post.id)
        .then(response=>{
            if(response.ok){
                return response.json()
            }
            throw response
        })
        .then(data =>{
            setComments(data)
        })
        .catch(error=>{
            console.log(error);
        }
        )
    }

    return(
        <div className='post'>
            <div className='post_header'>
                <Avatar  //no dp avatar
                alt='Sumesh'
                src=''/>
                <div className='post_headerInfo'>
                    <h3>{post.user?.username}</h3>
                    <button className='post_delete' onClick={handleDelete}>Delete</button>
                </div>
            </div>
            <img className='post_image' 
            src={imageUrl} //setImageUrl  later updated to imageurl
            alt='post'  //alternative text for an image
            />

            <h4 className='post_text'>{post.caption}</h4>
            <div className='post_comments'>
                {
                    comments.map((comment) => ( 
                        <p key={comment.id}>
                            <strong>{comment.username}:</strong>{comment.text}
                        </p>
                    )) //comment just a variable each comments 
                }
            </div>
            {authToken && (
                <form className='post_commentbox'>
                    <input className='post_input'
                    type='text'
                    placeholder='Add a comment'
                    value={newComment}
                    onChange={(e)=>setNewComment(e.target.value)}
                    />
                    <Button className='post_button'
                    type='submit'
                    disabled={!newComment}  //button disabled when no comments
                    onClick={postComment}>Post</Button>
                </form>
            )}

        </div>
    )
}

export default Post