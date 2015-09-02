var SliderPanel = React.createClass({
  render: function() {
    return <div className="panel-group" id="bvl_feedback_menu">
    {this.props.children}
    </div>
  }
});

var FeedbackPanelContent = React.createClass({
  propTypes: {
    feedback_level : React.PropTypes.string.isRequired,
    feedback_values : React.PropTypes.array
  },
  getInitialState: function(){
    return {
      currentEntryToggled: null
    }
  },
  markCommentToggle: function(index) {

    if(index == this.state.currentEntryToggled){
      this.setState({
        currentEntryToggled: null
      });
    }

    else{
      this.setState({
      currentEntryToggled: index
    });
  }
  },
  openThread(index){
    console.log("in openThread " + " " + index)
    this.props.open_thread(index);
  },
  closeThread(index){
    this.props.close_thread(index);
  },
  render: function(){

    if (this.props.threads){
      console.log("this props threads");
      console.log(this.props.threads);
      var currentEntryToggled = this.state.currentEntryToggled;

      var that = this
      var feedbackRows = this.props.threads.map(function(row, index){
        if (currentEntryToggled == index){
          var thisRowCommentToggled = true;
        }
        else{
          var thisRowCommentToggled = false;
        }
        return <FeedbackPanelRow key={row.FeedbackID} commentToggled = {thisRowCommentToggled} feedbackID={row.FeedbackID} sessionID={that.props.sessionID}
        commentID={that.props.commentID} candID={that.props.candID} status={row.QC_status} date={row.date}
        commentToggle={that.markCommentToggle.bind(this, index)} fieldname={row.FieldName}
        onClickClose={that.props.close_thread.bind(this,index)} onClickOpen={that.props.open_thread.bind(this,index)}/>
      }.bind(this));
      return(
        <div className="panel-collapse collapse in">
        <div className="panel-body">
        <table id ="current_thread_table" className="table table-hover table-primary table-bordered dynamictable">
        <thead id="current_thread_table_header">
        <tr className="info">
        <td>Date Opened</td>
        <td>Author</td>
        </tr>
        </thead>
        {feedbackRows}
        </table>
        </div>
        </div>
      )
    }
    else{
      return(
        <div>There are no threads for this user!</div>
      )
    }
  }
});


var FeedbackPanelRow = React.createClass({
  getInitialState: function(){
    return {
      thread_entries_toggled: false,
      thread_entries_loaded: false,
      thread_comment_toggled: false
    }
  },
  componentDidMount: function(){
    this.loadServerState();
  },
  loadServerState: function(){
    var that = this;

    request = $.ajax({
      type: "POST",
      url: "ajax/get_thread_entry_data.php",
      data:{
        "callFunc1" : this.props.feedbackID
      },
      success:function(data){
        that.setState({thread_entries_loaded : data});
      },
      error: function (xhr, desc, err){
        console.log(xhr);
        console.log("Details: " + desc + "\nError:" + err);
      }
    });
  },
  toggle_entries: function(){
    this.setState({thread_entries_toggled: !this.state.thread_entries_toggled});
  },
  toggle_thread_comment: function(){

    this.setState({thread_comment_toggled : !this.state.thread_comment_toggled});
    console.log(this.state.thread_comment_toggled);
    console.log("in toggle thread comment, this is the feedbackid" + this.props.feedbackID);

  },
  new_thread_entry: function(comment){

    var that = this;
    var feedbackID = this.props.feedbackID
    var sessionID = this.props.sessionID;
    var candID = this.props.candID;

    request = $.ajax({
      type: "POST",
      url: "ajax/thread_comment_bvl_feedback.php",
      data: {"comment" : comment,
      "feedbackID" : feedbackID,
      "candID" : candID},
      success: function (response) {
        console.log("new thread entry successfully added");
        that.loadServerState();
      },//end of success function
      error: function (xhr, desc, err){
        console.log(xhr);
        console.log("Details: " + desc + "\nError:" + err);
      }
    })
  },
  render: function() {
    var d = new Date();
    var feedbackID = this.props.feedbackID;
    if (this.state.thread_entries_toggled){
      var arrow = 'glyphicon glyphicon-chevron-down glyphs';
      var threadEntries = this.state.thread_entries_loaded.map(function(entry){
        return <tr className="thread_entry"><td colSpan="100%">{entry.UserID} on {entry.Testdate} commented:
        <br/> {entry.Comment}</td></tr>}
      );

    }
    else{
      var arrow = 'glyphicon glyphicon-chevron-right glyphs';
    }

    if (this.props.status == 'closed'){
      var buttonText = 'closed';
      var buttonClass = 'btn btn-success dropdown-toggle btn-sm' ;
      var dropdown = <li><a onClick={this.props.onClickOpen}>Open</a></li>;
    }
    else if (this.props.status == 'opened'){
      var buttonText = 'opened'
      var buttonClass = 'btn btn-danger dropdown-toggle btn-sm';
      var dropdown = <li><a onClick={this.props.onClickClose}>Close</a></li>;
    }
    return(
      <tbody>
      <tr>
      <td>{this.props.date}</td>
      <td>{this.props.fieldname}</td>
      <td>
      <div className="btn-group">
      <button name ="thread_button" type="button" className={buttonClass} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {buttonText}
      <span className="caret"></span>
      </button>
      <ul className="dropdown-menu">
      {dropdown}
      </ul>
      </div>
      <span className={arrow} onClick={this.toggle_entries}></span>
      <span className="glyphicon glyphicon-pencil" onClick={this.props.commentToggle}></span>

      </td>
      </tr>
      { this.props.commentToggled ?
        <CommentEntryForm onCommentSend={this.new_thread_entry}/>: null }
        {threadEntries}
        </tbody>
      );
    }
  });

  var CommentEntryForm = React.createClass({
    getInitialState: function(){
      return {
        value: null
      };
    },
    sendComment: function(){
      console.log("how to send comment " + this.state.value);
      this.props.onCommentSend(this.state.value);
      this.setState({
        value: "Comment added!"
      })
    },
    handleChange: function(event) {
      this.setState({value: event.target.value});
    },
    render: function(){
      var value = this.state.value;
      return (
        <tr><td colSpan="100%">admin on today commented:
        <div className="input-group" style={{width:'100%'}}><textarea className="form-control" value={value} style={{resize:'none'}} rows="2" ref="threadEntry" onChange={this.handleChange}></textarea><span className="input-group-addon btn btn-primary" onClick={this.sendComment}>Send</span></div></td></tr>
      );
    }

  });

  var AccordionPanel = React.createClass({
    getInitialState: function(){
      return{
        toggled : false
      }
    },
    toggleChange: function(){
      this.setState({
        toggled: !(this.state.toggled)
      })
    },
    render: function(){
      if(this.state.toggled){
       var panel_body_class = "panel-collapse collapse"
       var arrow_class = "collapsed"
      }
      else{
       var panel_body_class= "panel-collapse collapse in"
       var arrow_class = null
      }
      return(
        <div className="panel-group" id="accordion">
        <div className="panel panel-default" id="panel1">
        <div className="panel-heading">
        <h4 className="panel-title"><a className={arrow_class} onClick={this.toggleChange}>{this.props.title}</a></h4>
        </div>
        <div id="collapseThree" className={panel_body_class}>
        <div className="panel-body">
        {this.props.children}
        </div>
        </div>
        </div>
        </div>
      )
    }
  })

  var NewThreadPanel = React.createClass({
    propTypes: {
      select_options : React.PropTypes.array
    },
    getInitialState: function(){
      return{
        text_value : '',
        select_value : 'Across All Fields',
        input_value : 1
      }
    },
    handleSelectChange: function(event){
      this.setState({select_value: event.target.value});
    },
    handleTextChange: function(event){
      this.setState({text_value: event.target.value});
    },
    handleInputChange: function(event){
      this.setState({input_value: event.target.value});
    },
    createNewThread: function(){
      console.log("in create new thread");
      console.log(this.state.input_value);
      console.log(this.state.select_value);
      var that = this;

      request = $.ajax({
        type: "POST",
        url: "ajax/new_bvl_feedback.php",
        data:{
          "input_type": this.state.input_value,
          "field_name" : this.state.select_value,
          "comment" : this.state.text_value,
          "candID": this.props.candID,
          "sessionID" : this.props.sessionID,
          "commentID" : this.props.commentID,
          "user" : this.props.commentID
        },
        success:function(data){
          that.setState({
            text_value: "The new thread has been submitted!"
          });
          console.log("new thread data below");
          console.log(data);
          that.props.addThread(data);
        },
        error: function (xhr, desc, err){
          console.log(xhr);
          console.log("Details: " + desc + "\nError:" + err);
        }
      });
    },
    render: function(){
      var options = [];
      for (var key in this.props.select_options) {
        if (this.props.select_options.hasOwnProperty(key)) {
          options.push(<option value={key}>{this.props.select_options[key]}</option>)
        }
      }

      var feedback_types = this.props.feedback_types;
      var input = [];
      console.log(feedback_types);
      for(var key in feedback_types) {
        if(feedback_types.hasOwnProperty(key)) {
          input.push(<option value={feedback_types[key].Type}>{feedback_types[key].Label}</option>)
    }
}

      return <div id ="new_feedback">
      <div className="form-group">
      <textarea className="form-control" rows="4" id="comment" value={this.state.text_value} onChange={this.handleTextChange}></textarea>
      </div>
      <div className="form-group">
      <div className="row">
      <label className="col-xs-4">Field Name</label>
      <div className="col-xs-8">
      <select className="form-control input-sm" name = "input_type" selected={this.state.select_value} onChange={this.handleSelectChange} className="form-control">
      {options}
      </select>
      </div>
      </div>
      </div>
      <div className="form-group">
      <div className="row">
      <label className="col-xs-4">Feedback Type</label>
      <div className="col-xs-8">
      <select className="form-control input-sm" name = "input" selected={this.state.input_value} onChange={this.handleInputChange} className="form-control">
      {input}
      </select>
      </div>
      </div>
      </div>
      <div className="form-group">
      <button id="save_data" onClick={this.createNewThread} className="btn btn-default pull-right btn-sm">Save data</button>
      </div>
      </div>
    }
  });

  var FeedbackPanel = React.createClass({
    getInitialState: function(){
      return {
        threads: '',
      }
    },
    componentDidMount: function(){
      var that = this;
      request = $.ajax({
        type: "POST",
        url: "ajax/react_get_bvl_threads.php",
        data:{
          "candID": this.props.candID,
          "sessionID" : this.props.sessionID,
          "commentID" : this.props.commentID,
          "user" : this.props.commentID
        },
        success: function (data){
          state = data;
          console.log(state);
          that.setState({
            threads: state
          })
        },
        error: function (xhr, desc, err){
          console.log(xhr);
          console.log("Details: " + desc + "\nError:" + err);
        }
      });
      },
      loadThreadServerState: function(){
        var that = this;
        request = $.ajax({
          type: "POST",
          url: "ajax/react_get_bvl_threads.php",
          data:{
            "candID": this.props.candID,
            "sessionID" : this.props.sessionID,
            "commentID" : this.props.commentID,
            "user" : this.props.commentID
          },
          success: function (data){
            state = data;
            console.log(state);
            that.setState({
              threads: state
            })
          },
          error: function (xhr, desc, err){
            console.log(xhr);
            console.log("Details: " + desc + "\nError:" + err);
          }
        });
      },
      addThread: function(data){
        this.loadThreadServerState();
      },
      markThreadClosed: function(index) {
        var threads = this.state.threads;
        var entry = this.state.threads[index];
        console.log(entry);
        threads.splice(index, 1);
        entry.QC_status = 'closed';

        threads.push(entry);

        this.setState({
          threads: threads
        });
      },
      markThreadOpened: function(index) {
        console.log("in mark thread opened");
        var threads = this.state.threads;
        var entry = this.state.threads[index];
        threads.splice(index, 1);
        entry.QC_status = 'opened';

        threads.unshift(entry);

        this.setState({
          threads: threads
        });
      },
      markCommentToggle: function(index) {

        if(index == this.state.currentEntryToggled){
          this.setState({
            currentEntryToggled: null
          });
        }

        else{
          this.setState({
          currentEntryToggled: index
        });
      }
      },
    render: function(){
      title = "New " + this.props.feedback_level + " level feedback";
      return (
        <SliderPanel>
        <AccordionPanel title={title}>
                      <NewThreadPanel select_options={this.props.select_options} feedback_level={this.props.feedback_level} candID={this.props.candID}
                      sessionID={this.props.sessionID} commentID={this.props.commentID} addThread={this.addThread} feedback_types={this.props.feedback_types}></NewThreadPanel>
        </AccordionPanel>
        <div className="panel-group" id="accordion">
        <div className="panel panel-default" id="panel1">
        <div className="panel-heading">
        <h4 className="panel-title">Feedback thread</h4>
        </div>
        <FeedbackPanelContent threads={this.state.threads} close_thread={this.markThreadClosed} open_thread={this.markThreadOpened} feedback_level={this.props.feedback_level} candID={this.props.candID} sessionID={this.props.sessionID} commentID={this.props.commentID}/>
        </div>
        </div>
        </SliderPanel>
      );
    }
  });

  BehaviouralFeedbackPanel = React.createFactory(FeedbackPanel);
