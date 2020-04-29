import { component, componentVoid, elementOpen, elementClose, elementVoid, text, route } from "wabi"
import MapService from "../service/MapService"
import BuildingService from "../service/BuildingService"
import TimeService from "../service/TimeService"
import Enum from "../Enum"

const CellProps = {}
CellProps[Enum.Cell.Grass] = { class: "grass" }
CellProps[Enum.Cell.Road] = { class: "road" }
CellProps[Enum.Cell.House] = { class: "house" }
CellProps[Enum.Cell.Well] = { class: "well" }

const HeaderResource = component({
	state: {
		icon: null,
		value: 0
	},

	render() {
		elementOpen("item")
			elementVoid("img", { src: this.$icon })
			elementOpen("value")
				text(this.$value)
			elementClose("value")
		elementClose("item")
	}
})

const HeaderItem = component({
	state: {
		icon: null,
		value: 0
	},

	render() {
		elementOpen("item")
			elementOpen("icon")
				elementVoid("i", { class: this.$icon })
			elementClose("icon")

			elementOpen("value")
				text(this.$value)
			elementClose("value")
		elementClose("item")
	}
})

const HeaderDate = component({
	render() {
		elementOpen("item")
			elementOpen("value")
				text(TimeService.getDateString())
			elementClose("value")
		elementClose("item")
	}
})

const Header = component({
	render() {
		elementOpen("header")
			componentVoid(HeaderItem, {
				$icon: "fas fa-user",
				bind: "population/total"
			})
			componentVoid(HeaderResource, { 
				$icon: "assets/icon/gold.png", 
				bind: "resources/gold"
			})
			componentVoid(HeaderDate, {
				bind: "date"
			})
		elementClose("header")
	}
})

const Brushes = component({
	mount() {
		this.bind = "state/brush"
		this.handleClickFunc = this.handleClick.bind(this)
	},

	render() {
		elementOpen("brushes")
			this.renderBrush("arrow", Enum.Brush.Arrow)
			this.renderBrush("clear", Enum.Brush.Clear)
			this.renderBrush("road", Enum.Brush.Road)
			this.renderBrush("house", Enum.Brush.House)
			this.renderBrush("well", Enum.Brush.Well)
		elementClose("brushes")
	},

	renderBrush(name, brush) {
		elementOpen("brush", {
			"data-id": brush,
			class: (this.$value === brush) ? "active" : null,
			onclick: this.handleClickFunc
		})
			text(name)
		elementClose("brush")
	},

	handleClick(event) {
		const brushId = parseInt(event.currentTarget.dataset.id)
		BuildingService.selectBrush(brushId)
	}
})

const MapCell = component({
	render() {
		elementVoid("cell", CellProps[this.$value])
	}
})

const MapEntities = component({
	render() {
		const entities = this.$value

		elementOpen("entities")
			for(let n = 0; n < entities.length; n++) {
				const entity = entities[n]
				elementVoid("entity", {
					style: {
						left: entity.screenX + "px",
						top: entity.screenY + "px"
					}
				})				
			}
		elementClose("entities")
	}
})

const Map = component({
	mount() {
		this.props = {
			onmousemove: this.handleMouseMove.bind(this),
			onmouseup: this.handleMouseUp.bind(this)
		}
	},

	render() {
		const map = this.$value
		let index = 0

		elementOpen("map", this.props)
			for(let y = 0; y < map.sizeY; y++) {
				elementOpen("row")
					for(let x = 0; x < map.sizeX; x++) {
						componentVoid(MapCell, { bind: `map/data/${index}` })
						index++
					}
				elementClose("row")
			}

			componentVoid(MapEntities, { bind: "entities" })
		elementClose("map")
	},

	handleMouseMove(event) {
		const inputX = event.clientX - event.currentTarget.offsetLeft
		const inputY = event.clientY - event.currentTarget.offsetTop
		const coords = MapService.getCoords(inputX, inputY)
	},

	handleMouseUp(event) {
		const inputX = event.clientX - event.currentTarget.offsetLeft
		const inputY = event.clientY - event.currentTarget.offsetTop
		const coords = MapService.getCoords(inputX, inputY)
		BuildingService.useSelectedBrush(coords[0], coords[1])
	}	
})

const GameLayout = component({
	render() {	
		elementOpen("layout")
			componentVoid(Header)
			componentVoid(Brushes)

			elementOpen("game")
				componentVoid(Map, { bind: "map" })
			elementClose("game")
		elementClose("layout")
	}
})

route("/", GameLayout)