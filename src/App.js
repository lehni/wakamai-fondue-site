// TODO: Font.js can be defered/lazy loaded, as it will only
// be needed after user "uploads" a font
// TODO: deal with multiple fonts
import { fromDataBuffer } from "@wakamai-fondue/engine/browser";
import Hero from "./components/Hero.vue";
import Report from "./components/Report.vue";

export default {
	components: {
		Hero,
		Report
	},
	data() {
		return {
			font: false,
			dragging: false,
			error: false
		};
	},
	methods: {
		dragStatus(status) {
			this.dragging = status;
			if (status) {
				// If a new file is being dragged, remove any
				// old error messages so we don't confuse the user
				this.error = false;
			}
		},
		loadFondue(fileOrBlob, data, fileName, that) {
			// Destroy old font prop so Vue picks up change
			that.font = false;
			fromDataBuffer(data, fileName)
				.then(fondue => {
					that.error = false;
					that.injectStyleSheet(fileOrBlob);
					that.font = fondue;
					that.$nextTick(() =>
						document.getElementById("report").scrollIntoView()
					);
				})
				.catch(function() {
					that.error = true;
				});
		},
		getFont(e) {
			e.preventDefault();
			this.dragging = false;

			const that = this;

			// Loop over all uploaded files
			let files = e.target.files || e.dataTransfer.files;
			if (!files) return;
			[...files].forEach(file => {
				this.loadFont(file, file.name, that);
			});
		},
		loadFont(fileOrBlob, filename, that) {
			const reader = new FileReader();

			reader.onload = function() {
				const data = reader.result;
				that.loadFondue(fileOrBlob, data, filename, that);
			};

			reader.onerror = function(error) {
				// TODO: error handling
				// eslint-disable-next-line no-console
				console.log(error);
			};

			reader.readAsArrayBuffer(fileOrBlob);
		},
		getExampleFont(filename) {
			const that = this;

			// Grab font from server
			const request = new XMLHttpRequest();
			request.open("GET", `/${filename}`, true);
			request.responseType = "blob";
			request.send();

			request.onload = function() {
				const blob = request.response;
				that.loadFont(blob, filename, that);
			};
		},
		injectStyleSheet(file) {
			// Use the "uploaded" font on the page
			const id = "wakamai-fondue-custom-stylesheet";
			let style = document.getElementById(id);

			// Clean up previous instance of stylesheet
			if (!style) {
				style = document.createElement("style");
				style.id = id;
				document.head.appendChild(style);
			}

			// Inject new stylesheet
			const objectURL = URL.createObjectURL(file);
			style.innerHTML = "";
			style.appendChild(
				document.createTextNode(
					`@font-face { font-family: 'wakamai-fondue'; src: url('${objectURL}'); }`
				)
			);
		}
	}
};
