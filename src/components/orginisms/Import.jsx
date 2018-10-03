import React from "react"
import PropTypes from "prop-types"

import EditorHeader from "molecule/EditorHeader"
import TextField from "@material-ui/core/TextField"
import Checkbox from "@material-ui/core/Checkbox"
import FormGroup from "@material-ui/core/FormGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import InputLabel from "@material-ui/core/InputLabel"
import MenuItem from "@material-ui/core/MenuItem"
import Button from "@material-ui/core/Button"
import IconButton from "atom/IconButton"
import { createMuiTheme } from "@material-ui/core/styles"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"

const theme = createMuiTheme ({
	typography: {
		useNextVariants: true
	},
	palette: {
		primary: {
			main: "#4B4B4B"
		},
		secondary: {
			main: "#4B4B4B"
		}
	}
})

class Editor extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			data: "",
			errorMessage: ""
		}
	}

	componentDidMount () {
		let that = this
		window.setTimeout ( () => {
			that.setState ({ active: true })
		}, 100 )
	}

	onClose () {
		let that = this
		this.setState ({ active: false })
		window.setTimeout ( () => {
			that.props.onClose ()
		}, 400 )
	}

	onChange ( event ) {
		let obj = {}
		obj [ event.target.name ] = event.target.value
		this.setState ( obj )
	}

	onSave () {
		let that = this
		try {
			let cookies = JSON.parse ( that.state.data )
			let length = cookies.length
			for ( let data of cookies ) {
				data.url = `https://${data.domain.replace ( /^\./m, "" )}/`
				if ( data.hostOnly ) {
					delete data.domain
				}
				delete data.hostOnly
				if ( data.session ) {
					delete data.expirationDate
				}
				delete data.session
				chrome.cookies.set ( data, ( cookie ) => {})
			}
			that.onClose ()
		}
		catch ( error ) {
			that.setState ({ errorMessage: "Error while importing cookies" })
		}
	}

	render () {
		return <div className={`import ${this.state.active ? "active" : ""}`} >
			<div className="whitespace" onClick={this.onClose.bind (this)} />
			<div className="panel" >
				<div className="editor-header" >
					<IconButton
						stateful={false}
						onClick={this.onClose.bind (this)} >
						close
					</IconButton>
					<h1>Import Cookies</h1>
				</div>
				<div className="fields" >
					<MuiThemeProvider theme={theme} >
						<TextField
							label="JSON Array"
							name="data"
							value={this.state.data}
							onChange={this.onChange.bind (this)}
							error={this.state.errorMessage.length > 0}
							helperText={
								this.state.errorMessage.length > 0 ?
								this.state.errorMessage :
								""
							}
							rows={10}
							rowsMax={21}
							autoFocus={true}
							multiline={true}
						/>
						<Button
							variant="outlined"
							color="primary"
							className="submit"
							onClick={this.onSave.bind (this)}
							fullWidth={true} >
							Import Cookies
						</Button>
					</MuiThemeProvider>
				</div>
			</div>
		</div>
	}

}

Editor.propTypes = {
	onClose: PropTypes.func
}

Editor.defaultProps = {
	onClose: null
}

export default Editor
