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
			active: false,
			url: this.props.url,
			name: this.props.name,
			domain: this.props.domain,
			path: this.props.path,
			value: this.props.value,
			expirationDate: this.props.expirationDate,
			sameSite: this.props.sameSite,
			hostOnly: this.props.hostOnly,
			httpOnly: this.props.httpOnly,
			secure: this.props.secure,
			session: this.props.session
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

	onDelete () {
		let that = this
		let target = {
			url: this.props.url,
			name: this.props.name
		}
		chrome.cookies.remove ( target, () => {
			that.onClose ()
		})
	}

	onDuplicate () {
		let that = this
		let data = {
			url: this.props.url,
			name: this.state.name + " (copy)",
			domain: this.state.domain,
			path: this.state.path,
			value: this.state.value,
			expirationDate: this.state.expirationDate,
			sameSite: this.state.sameSite,
			httpOnly: this.state.httpOnly,
			secure: this.state.secure
		}
		chrome.cookies.set ( data, ( cookie ) => {
			that.setState ( Object.assign ( this.state, cookie ) )
			that.onClose ()
		})
	}

	onExport () {
		let cookie = {
			url: this.props.url,
			name: this.state.name,
			domain: this.state.domain,
			path: this.state.path,
			value: this.state.value,
			expirationDate: this.state.expirationDate,
			sameSite: this.state.sameSite,
			httpOnly: this.state.httpOnly,
			secure: this.state.secure
		}
		let node = document.createElement ("a")
		var data = JSON.stringify ( cookie, null, "\t" )
		data = encodeURIComponent ( data )
		node.setAttribute ( "href", "data:text/json;charset=utf-8," + data )
		node.setAttribute ( "download", `${cookie.name}.json` )
		node.click ()
		node.remove ()
		this.onClose ()
	}

	onSave () {
		let that = this
		let data = {
			url: this.props.url,
			name: this.state.name,
			domain: this.state.hostOnly ? null : this.state.domain,
			path: this.state.path,
			value: this.state.value,
			expirationDate: this.state.session ? null : this.state.expirationDate,
			sameSite: this.state.sameSite,
			httpOnly: this.state.httpOnly,
			secure: this.state.secure
		}
		chrome.cookies.remove ( { url: this.props.url, name: this.props.name }, () => {
			chrome.cookies.set ( data, cookie => {
				that.setState ( Object.assign ( this.state, cookie ) )
				that.onClose ()
			})
		})
	}

	render () {
		return <div className={`editor ${this.state.active ? "active" : ""}`} >
			<div className="whitespace" onClick={this.onClose.bind (this)} />
			<div className="panel" >
				<EditorHeader
					title={this.state.name}
					onDelete={this.onDelete.bind (this)}
					onDuplicate={this.onDuplicate.bind (this)}
					onExport={this.onExport.bind (this)}
					onClose={this.onClose.bind (this)}
				/>
				<div className="fields" >
					<MuiThemeProvider theme={theme} >
						<TextField
							label="Name"
							name="name"
							value={this.state.name}
							onChange={this.onChange.bind (this)}
							autoFocus={true}
						/>
						<TextField
							label="Domain"
							name="domain"
							value={this.state.domain}
							onChange={this.onChange.bind (this)}
							disabled={this.state.hostOnly}
						/>
						<TextField
							label="Path"
							name="path"
							value={this.state.path}
							onChange={this.onChange.bind (this)}
						/>
						<TextField
							label="Value"
							name="value"
							value={this.state.value}
							onChange={this.onChange.bind (this)}
						/>
						<TextField
							label={`Expiration Date (${new Date ().toLocaleString ( "en", { timeZoneName: "short" } ).split (" ").pop ()})`}
							type="datetime-local"
							value={(() => {
								let timestamp = this.state.session ? Math.round ( new Date ().getTime () / 1000 ) : this.state.expirationDate
								let offset = this.state.session ? 0 : new Date ().getTimezoneOffset ()
								let date = new Date ( ( timestamp - ( offset * 60 ) ) * 1000 )
								return date.toISOString ().substring (0, 16)
							})()}
							onChange={( event ) => {
								let date = event.target.value ? new Date ( event.target.value ) : new Date ()
								let expirationDate = Math.round ( date.getTime () / 1000 )
								this.setState ({ expirationDate })
							}}
							InputLabelProps={{
								shrink: true
							}}
							disabled={this.state.session}
						/>
						<FormControl>
							<InputLabel htmlFor="same-site" >Same Site</InputLabel>
							<Select
								value={this.state.sameSite}
								onChange={( event ) => this.setState ({ sameSite: event.target.value })}
								inputProps={{ id: "same-site" }} >
								<MenuItem value={"lax"}>Lax</MenuItem>
								<MenuItem value={"no_restriction"}>No Restriction</MenuItem>
								<MenuItem value={"strict"}>Strict</MenuItem>
								<MenuItem value={"unspecified"}>Unspecified</MenuItem>
							</Select>
						</FormControl>
						<div className="options" >
							<FormGroup row>
								<FormControlLabel
									control={
										<Checkbox
											checked={this.state.hostOnly}
											onChange={() => this.setState ({ hostOnly: !this.state.hostOnly })}
										/>
									}
									label="Host Only"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={this.state.httpOnly}
											onChange={() => this.setState ({ httpOnly: !this.state.httpOnly })}
										/>
									}
									label="HTTP Only"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={this.state.secure}
											onChange={() => this.setState ({ secure: !this.state.secure })}
										/>
									}
									label="Secure"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={this.state.session}
											onChange={() => this.setState ({ session: !this.state.session })}
										/>
									}
									label="Session"
								/>
							</FormGroup>
						</div>
						<Button
							variant="outlined"
							color="primary"
							className="submit"
							onClick={this.onSave.bind (this)}
							fullWidth={true} >
							Save
						</Button>
					</MuiThemeProvider>
				</div>
			</div>
		</div>
	}

}

Editor.propTypes = {
	url: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	domain: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	expirationDate: PropTypes.number.isRequired,
	sameSite: PropTypes.oneOf ([ "lax", "strict", "no_restriction", "unspecified" ]).isRequired,
	hostOnly: PropTypes.bool.isRequired,
	httpOnly: PropTypes.bool.isRequired,
	secure: PropTypes.bool.isRequired,
	onClose: PropTypes.func
}

Editor.defaultProps = {
	url: "",
	name: "",
	domain: "",
	path: "",
	value: "",
	expirationDate: 0,
	sameSite: "no_restriction",
	hostOnly: false,
	httpOnly: false,
	secure: false,
	onClose: null
}

export default Editor
