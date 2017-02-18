import React from 'react'
import ReactDOM from 'react-dom'
import request from 'request-promise'
import moment from 'moment'
/*
  Here is where we're going to put our front-end logic
  Before beginning delete the render function below (After you have already gotten hello world in the browser)
*/
const styles = {
  center: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '50%'
  },
  placeholder: {
    borderTop: '1.5px solid black',
    padding: '5px',
    marginBottom: '0.5%',
    width: '100%'
  },
  textRight: {
    textAlign: 'right'
  },
  smallMargin: {
    marginBottom: '0',
    marginTop: '0'
  }
}

// component that holds each todo text
class TodoBox extends React.Component {
  // constructor
  constructor(props) {
    super(props)
    this.state = {
      completed: props.completed
    }
    this.handleChange = this.handleChange.bind(this)
  }


  // handle checkbox updates
  handleChange(event) {
    let completed = !this.state.completed
    let {date, todo} = this.props
    // set state updates the UI with the new value of completed checkbox
    this.setState({ completed })
    request('http://localhost:3000/update/' + date + '/' + completed + '/' + todo).then(reponse => {
      console.log('updated');
    })
  }

  // render function from React ecosystem
  // the function must be always included when creating a React component using classes
  // the method should either return null or an html node (always enclosed by one tag only) 
  // the function gets call every time an change event happens in this component
  // for example, everytime this.setState() is called inside the component this render funtion is called again with the new state value  
  render() {
    let {date, todo} = this.props
    let now = moment(date).format('MMMM Do YYYY, h:mm:ss a');
    return <div style={styles.placeholder}>
      <h4><input value={date} checked={this.state.completed} onChange={this.handleChange} type="checkbox" /> {todo} </h4>
      <hr style={styles.smallMargin} />
      <h5>Created On: {now}</h5>
    </div>
  }
}

// component that holds our list
class ListHolder extends React.Component {

  // constructor of the class/component
  constructor(props) {
    super(props)

    this.state = {
      todos: []
    }

    // we do this so we can use the keyword `this` inside our functions correctly
    this.loadList = this.loadList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleButton = this.handleButton.bind(this);
  }

  // funciton that loads our list from the server
  loadList() {
    request('http://localhost:3000/get/all').then(todos => this.setState({ todos: JSON.parse(todos) }));
  }


  // This function comes from React ecosystem
  // the function is called after the component renders for the first time
  componentDidMount() {
    // loading the list for the first time
    this.loadList();
  }


  // handles the user submitting a todo text
  handleSubmit(event) {
    let todo = this.inputElement.value

    // makes sure the todo is not empty
    // db data should never be empty
    if (todo)
      request('http://localhost:3000/save/' + todo).then(response => {
        console.log('saved');
      })

    // loads the list again to update the UI  
    this.loadList();
    // clears the input text
    this.inputElement.value = "";
    event.preventDefault();

  }

  // handles the user clicking the remove button
  handleButton(event) {
    let deleteTodo = event.target.value
    request('http://localhost:3000/remove/' + deleteTodo).then(resp => {
      console.log('removed');
    })
    // loads the list again to update the UI
    this.loadList();
    event.preventDefault();
  }

  // Main rendering function
  render() {
    let {todos} = this.state
    let completedtodos = todos.filter(todo => todo.completed);
    todos = todos.filter(todo => !todo.completed);
    return <div>
      <h3 className="text-center">ToDos</h3>
      <form style={styles.center} className="input-group" onSubmit={this.handleSubmit}>
        <span className="input-group-btn">
          <button className="btn btn-secondary" type="button" onClick={this.handleSubmit}>Save</button>
        </span>
        <input className="form-control" type="text" ref={inputElement => this.inputElement = inputElement} placeholder="Enter Reminder" />
      </form>
      {todos.length >= 1 && <h3 className="text-center">Remainders</h3>}
      {todos.map(({todo, completed, date}) => <div key={date} style={styles.center}>
        <TodoBox date={date} completed={completed} todo={todo} />
      </div>)}
      {completedtodos.length >= 1 && <h3 className="text-center">Completed</h3>}
      {completedtodos.map(({todo, completed, date}, index) => <div style={styles.center} key={date}>
        <div style={styles.placeholder} className="input-group">
          <h4>{todo}</h4>
          <hr style={styles.smallMargin} />
          <h5><button type="button" value={date} className="btn btn-secondary" onClick={this.handleButton}>remove</button> Created On: {moment(date).format('MMMM Do YYYY, h:mm:ss a')}</h5>
        </div>
      </div>)}
    </div>
  }

}


// ReactDOM renders our component which then will be converted to normal HTML that the browser can compile
ReactDOM.render(<ListHolder />, document.getElementById('root'));
