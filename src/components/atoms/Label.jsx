import React from "react"

export default class Label extends React.Component {

	render () {
		return <div className="label" >{ this.props.children }</div>
	}

}
