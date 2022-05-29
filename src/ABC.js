import * as React from "react";


  class ProgressBar extends React.Component {
    render() {
      let percentage = (this.props.progress - this.props.minValue) / (this.props.maxValue - this.props.minValue);
      percentage =  Math.max(Math.min(percentage , 1), 0);
      const fillstyle = { width: (percentage * 100) + "%" };
      return (
        <div className="progressbar" style={this.props.style}>
          <div className="progressbar--fill" style={fillstyle}></div>
        </div>);
  }
  

}
export default ProgressBar;