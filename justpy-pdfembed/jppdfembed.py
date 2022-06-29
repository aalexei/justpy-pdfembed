import justpy as jp
import asyncio

class Pdfembed(jp.JustpyBaseComponent):

    vue_type = 'jppdfembed'
    req_id=0
    futures={}

    def __init__(self, **kwargs):
        self.options = jp.Dict()
        self.classes = ''
        self.style = ''
        self.client_id = ''
        self.embedMode = ""
        self.defaultViewMode = 'FIT_WIDTH'
        self.showAnnotationTools = False
        self.focusOnRendering = True
        self.showDownloadPDF = False
        self.showPrintPDF = False
        self.showPageControls = True
        self.dockPageControls = True
        self.showLeftHandPanel = True
        self.showDownloadPDF = True
        self.showPrintPDF = True
        self.autoSaveFrequency = 0
        self.enableFocusPolling = False
        self.showSaveButton = True
        self.clear = False
        self.show = True
        self.event_propagation = True
        self.pages = {}
        kwargs['temp'] = False  # Force an id to be assigned
        super().__init__(**kwargs)
        self.allowed_events = ['file_save']
        if type(self.options) != jp.Dict:
            self.options = jp.Dict(self.options)
        self.initialize(**kwargs)

    def add_to_page(self, wp: jp.WebPage):
        wp.add_component(self)

    def react(self, data):
        pass

    async def run_method_get_output(self, method, websocket):
        # adapted from https://github.com/elimintz/justpy/discussions/240
        self.req_id += 1
        req_id = f'pdfembed_{self.req_id}'
        self.futures[req_id]= asyncio.get_running_loop().create_future()

        await websocket.send_json(
            {'type': 'run_javascript',
             'data':f"Object(comp_dict['{self.id}'].{method})",
             'request_id': req_id,
             'send':True}
        )

        return await self.futures[req_id]

    async def handle_page_event(self, msg):
        # adapted from https://github.com/elimintz/justpy/discussions/240
        if msg.event_type != 'result_ready':
            return False
        if not msg.request_id in self.futures:
            return False
        fut = self.futures[msg.request_id]
        self.futures.pop(msg.request_id)
        if not fut.cancelled():
            fut.set_result(msg.result.copy())
        return True

    def convert_object_to_dict(self):
        d = {}
        d['vue_type'] = self.vue_type
        d['id'] = self.id
        d['show'] = self.show
        d['classes'] = self.classes
        d['style'] = self.style
        d['client_id'] = self.client_id
        d['showAnnotationTools'] = self.showAnnotationTools
        d['embedMode'] = self.embedMode
        d['defaultViewMode'] = self.defaultViewMode
        d['focusOnRendering'] = self.focusOnRendering
        d['showDownloadPDF'] = self.showDownloadPDF
        d['showPrintPDF'] = self.showPrintPDF
        d['showPageControls'] = self.showPageControls
        d['dockPageControls'] = self.dockPageControls
        d['showLeftHandPanel'] = self.showLeftHandPanel
        d['showDownloadPDF'] = self.showDownloadPDF
        d['showPrintPDF'] = self.showPrintPDF
        d['autoSaveFrequency'] = self.autoSaveFrequency
        d['enableFocusPolling'] = self.enableFocusPolling
        d['showSaveButton'] = self.showSaveButton
        d['event_propagation'] = self.event_propagation
        d['def'] = self.options
        d['events'] = self.events
        d['clear'] = self.clear
        d['options'] = self.options
        return d
