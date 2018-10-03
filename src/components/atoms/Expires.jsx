import React from "react"
import PropTypes from "prop-types"
import moment from "moment"

class Expires extends React.Component {

	render () {
		let today = new Date ().getTime ()
		let expires = this.props.timestamp * 1000
		let delta = Math.abs ( expires - today )
		let duration = moment.duration ( delta, "milliseconds" )
		return <div className="expires" >
			<div>
				{[
					duration._data.years,
					duration._data.months,
					duration._data.days
				].join ("/")}
			</div>
			<div>
				{[
					duration._data.hours,
					duration._data.minutes,
					duration._data.seconds
				].join (":")}
			</div>
		</div>
	}

}

Expires.propTypes = {
	timestamp: PropTypes.number.isRequired,
}

Expires.defaultProps = {
	timestamp: 0
}

export default Expires
