const loadCommentsBtnElement = document.getElementById("load-comments-btn");
const commentSectionElement = document.getElementById("comments");
const commentsFormElement = document.querySelector("#comments-form form");
const commnetTitleElement = document.getElementById("title");
const commentTextElement = document.getElementById("text");

function createCommentsList(comments) {
  const commentListElement = document.createElement("ol");
  for (const comment of comments) {
    const commentElement = document.createElement("li");
    commentElement.innerHTML = `
    <article class="comment-item">
        <h2>${comment.title}</h2>
        <p>${comment.text}</p>
    </article>
      `;
    commentListElement.appendChild(commentElement);
  }
  return commentListElement;
}
async function fetchCommentsForPosts() {
  const postId = loadCommentsBtnElement.dataset.postid;
  try{
    const response = await fetch(`/posts/${postId}/comments`);
  const responseData = await response.json();
  const responseDataComments = responseData.comments;
    if(!response.ok){
        alert('fetching comments failed!')
        return;
    }
  if (responseDataComments && responseDataComments.length > 0) {
    const commentsListElement = createCommentsList(responseDataComments);
    commentSectionElement.innerHTML = "";
    commentSectionElement.appendChild(commentsListElement);
  } else {
    commentSectionElement.firstElementChild.textContent =
      "We could not find any comments. Maybe add one?";
  }
  } catch(e){
    alert('getting comments failed!')
  }
}

async function saveComment(event) {
  event.preventDefault();
  const postId = commentsFormElement.dataset.postid;
  const enteredTitle = commnetTitleElement.value;
  const enteredText = commentTextElement.value;
  console.log(enteredText, enteredTitle);
  const comment = { title: enteredTitle, text: enteredText };

  try{

      const response = await fetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify(comment),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(response.ok){
          fetchCommentsForPosts();
      }else{
        alert('Could not send comment!')
      }
  } catch(e){
    alert('Could not send request - maybe try again later!')
  }

  
}

loadCommentsBtnElement.addEventListener("click", fetchCommentsForPosts);
commentsFormElement.addEventListener("submit", saveComment);
