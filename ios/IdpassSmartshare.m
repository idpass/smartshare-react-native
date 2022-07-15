#import "IdpassSmartshare.h"

@implementation IdpassSmartshare
RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(noop,
                 multiplyWithA:(double)a withB:(double)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(0);
}


@end
