export default interface AppInboxStyle {
  appInboxButton?: ButtonStyle;
  detailView?: DetailViewStyle;
  listView?: ListViewStyle;
}

export interface ButtonStyle {
  textOverride?: string;
  textColor?: string;
  backgroundColor?: string;
  showIcon?: boolean;
  textSize?: string;
  enabled?: boolean;
  borderRadius?: string;
  textWeight?: string;
}

export interface DetailViewStyle {
  title?: TextViewStyle;
  content?: TextViewStyle;
  receivedTime?: TextViewStyle;
  image?: ImageViewStyle;
  button?: ButtonStyle;
}

export interface TextViewStyle {
  visible?: boolean;
  textColor?: string;
  textSize?: string;
  textWeight?: string;
  textOverride?: string;
}

export interface ImageViewStyle {
  visible?: boolean;
  backgroundColor?: string;
}

export interface ListViewStyle {
  emptyTitle?: TextViewStyle;
  emptyMessage?: TextViewStyle;
  errorTitle?: TextViewStyle;
  errorMessage?: TextViewStyle;
  progress?: ProgressBarStyle;
  list?: AppInboxListViewStyle;
}

export interface ProgressBarStyle {
  visible?: boolean;
  progressColor?: string;
  backgroundColor?: string;
}

export interface AppInboxListViewStyle {
  backgroundColor?: string;
  item?: AppInboxListItemStyle;
}

export interface AppInboxListItemStyle {
  backgroundColor?: string;
  readFlag?: ImageViewStyle;
  receivedTime?: TextViewStyle;
  title?: TextViewStyle;
  content?: TextViewStyle;
  image?: ImageViewStyle;
}
