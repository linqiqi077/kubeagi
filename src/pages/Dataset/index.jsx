// 注意: 出码引擎注入的临时变量默认都以 "__$$" 开头，禁止在搭建的代码中直接访问。
// 例外：react 框架的导出名和各种组件名除外。
import React from 'react';

import {
  Page,
  Modal,
  FormilyForm,
  FormilyFormItem,
  Typography,
  FormilyTextArea,
  FormilySwitch,
  FormilySelect,
  Row,
  Col,
  Alert,
  Card,
  Space,
  Button,
  Input,
  Select,
  List,
  Collapse,
  Image,
  UnifiedLink,
  Tag,
  Divider,
  Table,
  Dropdown,
} from '@tenx-ui/materials';

import {
  AntdIconPlusOutlined,
  TenxIconRefresh,
  AntdIconDeleteOutlined,
} from '@tenx-ui/icon-materials';

import { useLocation, matchPath } from '@umijs/max';
import { DataProvider } from 'shared-components';
import qs from 'query-string';
import { getUnifiedHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';

import utils, { RefsManager } from '../../utils/__utils';

import * as __$$i18n from '../../i18n';

import __$$constants from '../../__constants';

import './index.css';

class Dataset$$Page extends React.Component {
  get location() {
    return this.props.self?.location;
  }
  get match() {
    return this.props.self?.match;
  }
  get history() {
    return this.props.self?.history;
  }
  get appHelper() {
    return this.props.self?.appHelper;
  }

  _context = this;

  get constants() {
    return __$$constants || {};
  }

  constructor(props, context) {
    super(props);

    this.utils = utils;

    this._refsManager = new RefsManager();

    __$$i18n._inject2(this);

    this.state = {
      search: undefined,
      type: undefined,
      field: undefined,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      loading: false,
      data: [],
      addVersion: {
        visible: false,
        data: {},
      },
    };

    this._fetchData = this.utils._.debounce(this.fetchData, 500);
  }

  $ = refName => {
    return this._refsManager.get(refName);
  };

  $$ = refName => {
    return this._refsManager.getAll(refName);
  };

  componentWillUnmount() {}

  form(name) {
    return this.$(name || 'formily_create')?.formRef?.current?.form;
  }

  async fetchData() {
    this.setState({
      loading: true,
    });
    const res = await this.utils.bff
      .listDatasets({
        input: {
          labelSelector: this.state.type,
          fieldSelector: this.state.field,
          keyword: this.state.search,
          namespace: this.appHelper.utils.getAuthData().project,
          pageSize: this.state.pageSize,
          page: this.state.page,
        },
        versionsInput: {
          namespace: this.appHelper.utils.getAuthData().project,
          pageSize: 1000,
          page: 1,
        },
        filesInput: {
          keyword: '',
          pageSize: 1,
          page: 1,
        },
      })
      .catch(e => {
        this.setState({
          loading: false,
        });
      });
    this.setState({
      data: res?.Dataset?.listDatasets?.nodes,
      totalCount: res?.Dataset?.listDatasets?.totalCount,
      loading: false,
    });
  }

  async addVersionFetch() {
    const _version = 'v' + (this.getVersionsNumMax(this.state.addVersion.data?.versions.nodes) + 1);
    const payload = {
      input: {
        name: this.state.addVersion.data?.name + '-' + _version,
        namespace: this.state.addVersion.data?.namespace,
        datasetName: this.state.addVersion.data?.name,
        displayName: '',
        description: this.form().values.description,
        inheritedFrom: this.form().values.inheritedFrom,
        version: _version,
        released: 0,
      },
    };
    const res = await this.utils.bff.createVersionedDataset(payload);
    if (res?.VersionedDataset?.createVersionedDataset?.name) {
      this.utils.notification.success({
        message: '新增数据集版本成功',
      });
      this.onAddVersionCancel();
      this.fetchData();
    }
    this.setState({
      data: res?.Dataset?.listDatasets?.nodes,
      totalCount: res?.Dataset?.listDatasets?.totalCount,
    });
  }

  testFunc() {
    return <div className="test-aliLowcode-func">{this.state.test}</div>;
  }

  addVersion(event, params) {
    event.stopPropagation();
    this.setState({
      addVersion: {
        visible: true,
        data: params.data,
      },
    });
  }

  refresh(event) {
    event.stopPropagation();
    this.fetchData();
  }

  getVersionsNumMax(versions) {
    return Math.max(...versions.map(v => parseInt(v?.name?.match(/\d+/)?.[0] || '0')));
  }

  onClick(event) {
    // 点击按钮时的回调
  }

  linkClick(event) {
    event.stopPropagation();
  }

  onSearchChange(event) {
    // 输入框内容变化时的回调
    this.setState(
      {
        search: event.target.value,
      },
      this._fetchData
    );
  }

  onTypeChange(event) {
    // 输入框内容变化时的回调
    this.setState(
      {
        type: event,
      },
      this.fetchData
    );
  }

  onFieldChange(event) {
    // 输入框内容变化时的回调
    this.setState(
      {
        field: event,
      },
      this.fetchData
    );
  }

  onPageChange(page, pageSize) {
    // 页码或 pageSize 改变的回调
    this.setState(
      {
        page,
        pageSize,
      },
      this.fetchData
    );
  }

  onAddVersionOK() {
    // 点击遮罩层或右上角叉或取消按钮的回调
    this.form()
      .validate()
      .then(this.addVersionFetch)
      .catch(e => {});
  }

  onAddVersionCancel() {
    // 点击遮罩层或右上角叉或取消按钮的回调
    this.setState({
      addVersion: {
        visible: false,
        data: {},
      },
    });
  }

  toDetail(event) {
    // onClick	点击 左侧按钮 调用此函数
    console.log('onDropDownClick', event);
  }

  showTotal(total, range) {
    // 用于格式化显示表格数据总量
    return `共 ${total} 条`;
  }

  onDelDataset(event, params) {
    event.stopPropagation();
    // 点击按钮时的回调
    const that = this;
    this.utils.Modal.confirm({
      title: '删除数据集',
      content: `确定删除数据集：${params.item.name}？`,
      async onOk() {
        const res = await that.utils.bff
          .deleteDatasets({
            input: {
              namespace: params.item.namespace,
              name: params.item.name,
            },
          })
          .catch(e => {
            that.utils.notification.warn({
              message: '删除数据集失败',
            });
          });
        that.utils.notification.success({
          message: '删除数据集成功',
        });
        that.fetchData();
      },
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const __$$context = this._context || this;
    const { state } = __$$context;
    return (
      <Page>
        {!!__$$eval(() => this.state.addVersion.visible) && (
          <Modal
            mask={true}
            onOk={function () {
              return this.onAddVersionOK.apply(
                this,
                Array.prototype.slice.call(arguments).concat([])
              );
            }.bind(this)}
            open={true}
            title={this.i18n('i18n-wgpt60zj') /* 新增版本 */}
            centered={false}
            keyboard={true}
            onCancel={function () {
              return this.onAddVersionCancel.apply(
                this,
                Array.prototype.slice.call(arguments).concat([])
              );
            }.bind(this)}
            forceRender={false}
            maskClosable={false}
            confirmLoading={false}
            destroyOnClose={true}
            __component_name="Modal"
          >
            <FormilyForm
              ref={this._refsManager.linkRef('formily_create')}
              formHelper={{ autoFocus: true }}
              componentProps={{
                colon: false,
                layout: 'horizontal',
                labelCol: 5,
                labelAlign: 'left',
                wrapperCol: 19,
              }}
              createFormProps={{
                initialValues: __$$eval(() => ({
                  inheritedFromSwitch: !!this.state.addVersion.data?.versions.nodes.length,
                })),
              }}
              __component_name="FormilyForm"
            >
              <FormilyFormItem
                fieldProps={{
                  name: 'FormilyFormItem',
                  title: '数据集版本',
                  'x-component': 'FormilyFormItem',
                  'x-validator': [],
                }}
                decoratorProps={{ 'x-decorator-props': { labelEllipsis: true } }}
                __component_name="FormilyFormItem"
              >
                <Typography.Text
                  style={{ fontSize: '' }}
                  strong={false}
                  disabled={false}
                  ellipsis={true}
                  __component_name="Typography.Text"
                >
                  {__$$eval(
                    () =>
                      'v' + (this.getVersionsNumMax(this.state.addVersion.data?.versions.nodes) + 1)
                  )}
                </Typography.Text>
              </FormilyFormItem>
              <FormilyTextArea
                fieldProps={{
                  name: 'description',
                  title: '版本描述',
                  'x-component': 'Input.TextArea',
                  'x-validator': [],
                }}
                componentProps={{ 'x-component-props': { placeholder: '请输入描述' } }}
                decoratorProps={{ 'x-decorator-props': { labelEllipsis: true } }}
                __component_name="FormilyTextArea"
              />
              <FormilySwitch
                fieldProps={{
                  name: 'inheritedFromSwitch',
                  title: '继承历史版本',
                  'x-validator': [],
                }}
                componentProps={{ 'x-component-props': { loading: false, disabled: false } }}
                decoratorProps={{ 'x-decorator-props': { labelEllipsis: true } }}
                __component_name="FormilySwitch"
              />
              <FormilySelect
                fieldProps={{
                  enum: __$$eval(() =>
                    this.state.addVersion.data?.versions.nodes.map(v => ({
                      label: v.name,
                      value: v.name,
                    }))
                  ),
                  name: 'inheritedFrom',
                  title: this.i18n('i18n-ygp6an7a') /* 历史版本 */,
                  required: true,
                  'x-display': "{{ $form.values?.inheritedFromSwitch ? 'visible' : 'hidden' }}",
                  'x-validator': [],
                  _unsafe_MixedSetter_enum_select: 'ExpressionSetter',
                }}
                componentProps={{
                  'x-component-props': {
                    disabled: false,
                    allowClear: false,
                    placeholder: this.i18n('i18n-84e86ujo') /* 请选择历史版本 */,
                    _sdkSwrGetFunc: {},
                    _unsafe_MixedSetter__sdkSwrGetFunc_select: 'ObjectSetter',
                  },
                }}
                decoratorProps={{ 'x-decorator-props': { labelEllipsis: true } }}
                __component_name="FormilySelect"
              />
            </FormilyForm>
          </Modal>
        )}
        <Row wrap={true} __component_name="Row">
          <Col span={24} __component_name="Col">
            <Typography.Title
              bold={true}
              level={1}
              bordered={false}
              ellipsis={true}
              __component_name="Typography.Title"
            >
              {this.i18n('i18n-5djmpfvu') /* 数据集管理 */}
            </Typography.Title>
          </Col>
          <Col span={24} __component_name="Col">
            <Alert
              type="info"
              style={{ marginBottom: '8px' }}
              message="数据集描述----------暂时还未想好，后续补充"
              showIcon={true}
              __component_name="Alert"
            />
          </Col>
        </Row>
        <Card
          size="default"
          type="default"
          actions={[]}
          loading={false}
          bordered={false}
          hoverable={false}
          __component_name="Card"
        >
          <Row wrap={false} __component_name="Row">
            <Col flex="auto" span={16} style={{ display: 'flex' }} __component_name="Col">
              <Space align="center" direction="horizontal" __component_name="Space">
                <Button
                  href="/dataset/create"
                  icon={<AntdIconPlusOutlined __component_name="AntdIconPlusOutlined" />}
                  type="primary"
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  disabled={false}
                  __component_name="Button"
                >
                  {this.i18n('i18n-2ejg9q5l') /* 新增数据集 */}
                </Button>
                <Button
                  icon={<TenxIconRefresh __component_name="TenxIconRefresh" />}
                  block={false}
                  ghost={false}
                  shape="default"
                  danger={false}
                  onClick={function () {
                    return this.refresh.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  disabled={false}
                  __component_name="Button"
                >
                  刷新
                </Button>
                <Input.Search
                  style={{ width: '200px' }}
                  value={__$$eval(() => this.state.search)}
                  onChange={function () {
                    return this.onSearchChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  placeholder={this.i18n('i18n-vce3sfm7') /* 请输入数据集名称搜索 */}
                  __component_name="Input.Search"
                />
              </Space>
            </Col>
            <Col
              flex="auto"
              style={{ display: 'flex', justifyContent: 'flex-end' }}
              __component_name="Col"
            >
              <Space align="center" direction="horizontal" __component_name="Space">
                <Select
                  mode="single"
                  style={{ width: 200 }}
                  value={__$$eval(() => this.state.type)}
                  options={[
                    { label: '文本', value: 'text', disabled: false },
                    { label: '图片', value: 'image', disabled: false },
                    { label: '视频', value: 'video', disabled: false },
                  ]}
                  disabled={false}
                  onChange={function () {
                    return this.onTypeChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  allowClear={true}
                  showSearch={true}
                  placeholder={this.i18n('i18n-af4xea8m') /* 请选择类型 */}
                  _sdkSwrGetFunc={{ label: '', value: '', params: [] }}
                  notFoundContent=""
                  __component_name="Select"
                />
                <Select
                  style={{ width: 200 }}
                  options={[
                    { label: '科技', value: 'science', disabled: false },
                    { label: '金融', value: 'finance', disabled: false },
                    { label: '教育', value: 'education', disabled: false },
                    { label: '医疗', value: 'medical', disabled: false },
                    { label: '能源', value: 'energy', disabled: false },
                    { label: '法律', value: 'law', disabled: false },
                    { label: '其他', value: 'others', disabled: false },
                  ]}
                  disabled={false}
                  onChange={function () {
                    return this.onFieldChange.apply(
                      this,
                      Array.prototype.slice.call(arguments).concat([])
                    );
                  }.bind(this)}
                  allowClear={true}
                  showSearch={true}
                  placeholder="请选择应用场景"
                  _sdkSwrGetFunc={{ params: [''] }}
                  __component_name="Select"
                />
              </Space>
            </Col>
          </Row>
          <List
            grid={false}
            size="small"
            split={false}
            style={{ marginTop: '16px' }}
            rowKey="name"
            loading={__$$eval(() => this.state.loading)}
            bordered={false}
            dataSource={__$$eval(() => this.state.data)}
            gridEnable={false}
            itemLayout="vertical"
            pagination={{
              size: 'default',
              total: __$$eval(() => this.state.totalCount),
              simple: false,
              current: __$$eval(() => this.state.page),
              onChange: function () {
                return this.onPageChange.apply(
                  this,
                  Array.prototype.slice.call(arguments).concat([])
                );
              }.bind(this),
              pageSize: __$$eval(() => this.state.pageSize),
              position: 'bottom',
              showTotal: function () {
                return this.showTotal.apply(this, Array.prototype.slice.call(arguments).concat([]));
              }.bind(this),
              pagination: { pageSize: 5 },
              showQuickJumper: false,
              showSizeChanger: false,
            }}
            renderItem={item =>
              (__$$context => (
                <List.Item style={{ marginBottom: '16px' }}>
                  <Row wrap={true} __component_name="Row">
                    <Col span={24} __component_name="Col">
                      <Collapse
                        size="large"
                        ghost={false}
                        items={[
                          {
                            key: __$$eval(() => item.name),
                            label: (
                              <Row
                                wrap={true}
                                style={{ display: 'flex', justifyContent: 'space-between' }}
                                __component_name="Row"
                              >
                                <Col
                                  span={11}
                                  style={{ display: 'flex', alignItems: 'center' }}
                                  __component_name="Col"
                                >
                                  <Image
                                    src={__$$eval(
                                      () =>
                                        __$$context.constants.DATASET_DATA?.typeIcons?.[
                                          item.contentType
                                          ]
                                    )}
                                    width={32}
                                    height={32}
                                    preview={false}
                                    fallback=""
                                    __component_name="Image"
                                  />
                                  <UnifiedLink
                                    to={__$$eval(() => `/dataset/detail/${item.name}`)}
                                    style={{ fontSize: '18px', marginLeft: '16px' }}
                                    target="_blank"
                                    __component_name="UnifiedLink"
                                  >
                                    {__$$eval(() => item.name)}
                                  </UnifiedLink>
                                </Col>
                                <Col
                                  span={4}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  __component_name="Col"
                                  flex="200px"
                                >
                                  <Tag color="warning" closable={false} __component_name="Tag">
                                    {__$$eval(() => item.contentType)}
                                  </Tag>
                                  <Tag color="processing" closable={false} __component_name="Tag">
                                    {__$$eval(() => item.field || '未知')}
                                  </Tag>
                                </Col>
                                <Col
                                  span={4}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  __component_name="Col"
                                  flex="150px"
                                >
                                  <Typography.Text
                                    style={{ fontSize: '' }}
                                    strong={false}
                                    disabled={false}
                                    ellipsis={true}
                                    __component_name="Typography.Text"
                                  >
                                    {__$$eval(() => `版本数：${item.versions.totalCount}`)}
                                  </Typography.Text>
                                </Col>
                                <Col
                                  span={4}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                  }}
                                  __component_name="Col"
                                >
                                  <Button
                                    icon={
                                      <AntdIconPlusOutlined __component_name="AntdIconPlusOutlined" />
                                    }
                                    type="text"
                                    block={false}
                                    ghost={false}
                                    shape="default"
                                    danger={false}
                                    onClick={function () {
                                      return this.addVersion.apply(
                                        this,
                                        Array.prototype.slice.call(arguments).concat([
                                          {
                                            testKey: 123,
                                            data: item,
                                          },
                                        ])
                                      );
                                    }.bind(__$$context)}
                                    disabled={false}
                                    __component_name="Button"
                                  >
                                    {this.i18n('i18n-wgpt60zj') /* 新增版本 */}
                                  </Button>
                                  <Divider
                                    mode="default"
                                    type="vertical"
                                    dashed={false}
                                    defaultOpen={false}
                                    __component_name="Divider"
                                  />
                                  <Button
                                    icon={
                                      <AntdIconDeleteOutlined __component_name="AntdIconDeleteOutlined" />
                                    }
                                    type="text"
                                    block={false}
                                    ghost={false}
                                    shape="default"
                                    danger={false}
                                    onClick={function () {
                                      return this.onDelDataset.apply(
                                        this,
                                        Array.prototype.slice.call(arguments).concat([
                                          {
                                            item: item,
                                          },
                                        ])
                                      );
                                    }.bind(__$$context)}
                                    disabled={false}
                                    __component_name="Button"
                                  >
                                    {this.i18n('i18n-z0idrepg') /* 删除 */}
                                  </Button>
                                </Col>
                              </Row>
                            ),
                            children: (
                              <Table
                                size="middle"
                                rowKey="id"
                                scroll={{ scrollToFirstRowOnChange: true }}
                                columns={[
                                  {
                                    key: 'version',
                                    title: '版本',
                                    ellipsis: { showTitle: true },
                                    dataIndex: 'version',
                                  },
                                  {
                                    key: 'syncStatus',
                                    title: '导入状态',
                                    dataIndex: 'syncStatus',
                                    render: (text, record) =>
                                      ({
                                        FileSyncing: '同步中',
                                        FileSyncFailed: '同步失败',
                                        FileSyncSuccess: '同步成功',
                                      }[text] || '未知'),
                                  },
                                  {
                                    key: 'dataProcessStatus',
                                    title: '数据处理状态',
                                    render: (text, record) => text || '未开始',
                                    dataIndex: 'dataProcessStatus',
                                  },
                                  {
                                    key: 'released',
                                    title: '发布状态',
                                    render: (text, record) =>
                                      ({
                                        0: '未发布',
                                        1: '已发布',
                                      }[text] || '未知'),
                                    dataIndex: 'released',
                                  },
                                  {
                                    key: 'files',
                                    title: '数据量',
                                    render: (text, record) => text.totalCount,
                                    dataIndex: 'files',
                                  },
                                  {
                                    key: 'updateTimestamp',
                                    title: '最后更新时间',
                                    dataIndex: 'updateTimestamp',
                                  },
                                  {
                                    key: 'action',
                                    title: '操作',
                                    render: (text, record, index) =>
                                      (__$$context => (
                                        <Dropdown.Button
                                          menu={{
                                            items: __$$eval(() =>
                                              (() => {
                                                return [
                                                  {
                                                    key: '1',
                                                    label: '1',
                                                  },
                                                ];
                                              })()
                                            ),
                                          }}
                                          type="default"
                                          danger={false}
                                          onClick={function () {
                                            return this.toDetail.apply(
                                              this,
                                              Array.prototype.slice.call(arguments).concat([])
                                            );
                                          }.bind(__$$context)}
                                          trigger={['hover']}
                                          disabled={false}
                                          placement="bottomRight"
                                          __component_name="Dropdown.Button"
                                          destroyPopupOnHide={true}
                                          overlayStyle={{}}
                                        >
                                          <Typography.Text
                                            style={{ fontSize: '' }}
                                            strong={false}
                                            disabled={false}
                                            ellipsis={true}
                                            __component_name="Typography.Text"
                                          >
                                            查看详情
                                          </Typography.Text>
                                        </Dropdown.Button>
                                      ))(
                                        __$$createChildContext(__$$context, { text, record, index })
                                      ),
                                    dataIndex: 'action',
                                  },
                                ]}
                                dataSource={__$$eval(() =>
                                  (function () {
                                    return item.versions?.nodes || [];
                                  })()
                                )}
                                pagination={{
                                  size: 'default',
                                  simple: false,
                                  pageSize: 5,
                                  pagination: { pageSize: 10 },
                                  showQuickJumper: false,
                                  showSizeChanger: false,
                                }}
                                showHeader={true}
                                __component_name="Table"
                              />
                            ),
                            showArrow: true,
                            _unsafe_MixedSetter_label_select: 'SlotSetter',
                            _unsafe_MixedSetter_children_select: 'SlotSetter',
                          },
                        ]}
                        style={{}}
                        bordered={true}
                        accordion={true}
                        __component_name="Collapse"
                        expandIconPosition="right"
                        destroyInactivePanel={true}
                      />
                    </Col>
                  </Row>
                </List.Item>
              ))(__$$createChildContext(__$$context, { item }))
            }
            __component_name="List"
          />
        </Card>
      </Page>
    );
  }
}

const PageWrapper = (props = {}) => {
  const location = useLocation();
  const history = getUnifiedHistory();
  const match = matchPath({ path: '/dataset' }, location.pathname);
  history.match = match;
  history.query = qs.parse(location.search);
  const appHelper = {
    utils,
    location,
    match,
    history,
  };
  const self = {
    appHelper,
    ...appHelper,
  };
  return (
    <DataProvider
      self={self}
      sdkInitFunc={{
        enabled: undefined,
        func: 'undefined',
        params: undefined,
      }}
      sdkSwrFuncs={[
        {
          func: 'undefined',
          params: undefined,
          enableLocationSearch: undefined,
        },
      ]}
      render={dataProps => (
        <Dataset$$Page {...props} {...dataProps} self={self} appHelper={appHelper} />
      )}
    />
  );
};
export default PageWrapper;

function __$$eval(expr) {
  try {
    return expr();
  } catch (error) {}
}

function __$$evalArray(expr) {
  const res = __$$eval(expr);
  return Array.isArray(res) ? res : [];
}

function __$$createChildContext(oldContext, ext) {
  const childContext = {
    ...oldContext,
    ...ext,
  };
  childContext.__proto__ = oldContext;
  return childContext;
}